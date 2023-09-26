/* eslint-disable no-null/no-null */
import { AWS_ACCESS_KEY_ID, DB_INSTANCE, DB_REGION, DB_SYS_USERS_TO_IGNORE, LAST_SQL_SCAN, SECRET_ACCESS_KEY } from '../../constants';
import { ConfigDAO, DataAccessFactory, DbQueries, DbQueryDAO, Member, MemberDAO } from '../../model';
import {
  DescribeDBLogFilesCommand,
  DescribeDBLogFilesCommandOutput,
  DescribeDBLogFilesDetails,
  DownloadDBLogFilePortionCommand,
  DownloadDBLogFilePortionCommandOutput,
  RDSClient,
} from '@aws-sdk/client-rds';

import { Config } from '../../core';
import { SQLTransaction } from '../../adapters';

type QueryCount = { username: string; inserts: Record<number, number> };
type Register = (digest: Array<[Date, Array<string>]>, latest: Date) => void;

export class SQLLogScanner {
  private static readonly RX_ANONYMOUS = new RegExp(/::@:|:postgres@|:postgress@|\[unknown\]/);
  private static readonly RX_UTC = new RegExp(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC)/);
  private static readonly RX_USERNAME = new RegExp(/^(?:[^:]*:){4}([^@]*)@/);
  private readonly usersToIgnore;
  private readonly memberDAO: MemberDAO;
  private readonly dbQueryDAO: DbQueryDAO;
  private readonly configDAO: ConfigDAO;
  private readonly client: RDSClient;

  public constructor() {
    this.usersToIgnore = Config.get(DB_SYS_USERS_TO_IGNORE) ? Config.get(DB_SYS_USERS_TO_IGNORE).split(',') : [];
    this.memberDAO = DataAccessFactory.getMemberDAO();
    this.dbQueryDAO = DataAccessFactory.getDbQueryDAO();
    this.configDAO = DataAccessFactory.getConfigDAO();
    this.client = new RDSClient({
      region: Config.get(DB_REGION),
      credentials: {
        accessKeyId: Config.get(AWS_ACCESS_KEY_ID),
        secretAccessKey: Config.get(SECRET_ACCESS_KEY),
      },
    });
  }

  private async firstScan(): Promise<string> {
    const result: Date = new Date();
    result.setHours(0, 0, 0, 0);
    await Config.set(LAST_SQL_SCAN, result.toISOString());
    return result.toISOString();
  }

  private async getLogFilesNames(since: Date, marker?: string): Promise<Array<DescribeDBLogFilesDetails>> {
    const response: DescribeDBLogFilesCommandOutput = await this.client.send(
      new DescribeDBLogFilesCommand({
        DBInstanceIdentifier: Config.get(DB_INSTANCE),
        FileLastWritten: since.getTime(),
        Marker: marker,
      }),
    );

    if (response.Marker) {
      response.DescribeDBLogFiles = response.DescribeDBLogFiles.concat(await this.getLogFilesNames(since, response.Marker));
    }

    return response.DescribeDBLogFiles;
  }

  private roundMinutes(d: Date): Date {
    const result: Date = new Date(d);
    result.setSeconds(0);
    result.setMilliseconds(0);
    return result;
  }

  private digestLines(content: string, since: Date): [Array<[Date, Array<string>]>, Date] {
    const lines: Array<[Date, string]> = content
      .split('\n')
      .filter((line: string) => !SQLLogScanner.RX_ANONYMOUS.test(line) && SQLLogScanner.RX_UTC.test(line))
      .filter((line: string) => new Date(line.substring(0, 23)).getTime() >= since.getTime())
      .map((line: string) => [new Date(line.substring(0, 23)), line.match(SQLLogScanner.RX_USERNAME)[1]]);
    let latest: Date = new Date(0);

    const preResult: Array<[Date, Set<string>]> = [];
    if (lines.length) {
      let currentDate: Date = this.roundMinutes(lines[0][0]);

      preResult.push([currentDate, new Set()]);

      while (lines.length) {
        const line: [Date, string] = lines.shift();
        latest = new Date(Math.max(latest.getTime(), line[0].getTime()));

        const date: Date = this.roundMinutes(line[0]);
        if (date.getTime() === currentDate.getTime()) {
          preResult[preResult.length - 1][1].add(line[1]);
        } else {
          preResult.push([date, new Set([line[1]])]);
          currentDate = date;
        }
      }
    }

    const result: Array<[Date, Array<string>]> = preResult.map((record: [Date, Set<string>]) => [record[0], Array.from(record[1])]);
    return [result, latest];
  }

  private async scanLogContent(fileName: string, since: Date, register: Register, marker?: string): Promise<void> {
    console.debug(`${fileName} @ ${marker}`);
    const response: DownloadDBLogFilePortionCommandOutput = await this.client.send(
      new DownloadDBLogFilePortionCommand({
        DBInstanceIdentifier: Config.get(DB_INSTANCE),
        LogFileName: fileName,
        NumberOfLines: 10000,
        Marker: marker || '0',
      }),
    );

    const digest: [Array<[Date, Array<string>]>, Date] = this.digestLines(response.LogFileData, since);

    register(digest[0], digest[1]);

    if (response.AdditionalDataPending) {
      await this.scanLogContent(fileName, since, register, response.Marker);
    }
  }

  private splitHours(timeTable: Map<number, Set<string>>): Map<number, Map<string, number>> {
    const resultTable: Map<number, Map<string, number>> = new Map();

    for (const [date, usernames] of timeTable.entries()) {
      const hourDate: Date = new Date(date);
      hourDate.setMinutes(0, 0, 0);
      const epochTime: number = hourDate.getTime();

      if (!resultTable.has(epochTime)) {
        resultTable.set(epochTime, new Map<string, number>());
      }

      const hourMap: Map<string, number> = resultTable.get(epochTime);

      for (const username of usernames) {
        if (!hourMap.has(username)) {
          hourMap.set(username, 1);
        } else {
          hourMap.set(username, (hourMap.get(username) || 0) + 1);
        }
      }
    }
    return resultTable;
  }

  private async persist(dbQueries: Array<DbQueries>, totalLatest: Date): Promise<void> {
    const transaction: SQLTransaction = this.dbQueryDAO.createTransaction();
    try {
      await transaction.begin();
      await Promise.all(
        dbQueries
          .map(async (queries: DbQueries) => this.dbQueryDAO.registerCounts(queries, transaction))
          .concat([this.configDAO.set(LAST_SQL_SCAN, totalLatest.toISOString(), transaction)]),
      );
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      console.error(e);
    }
  }

  public scan(): void {
    void (async (): Promise<void> => {
      await this.memberDAO.isReady();

      const members: Array<Member> = await this.memberDAO.getMembers(true);

      console.info('Starting SQL monitoring...');

      const lastScan: string = Config.get(LAST_SQL_SCAN) || (await this.firstScan());
      const since: Date = new Date(lastScan);

      const minutesTable: Map<number, Set<string>> = new Map();

      const files: Array<DescribeDBLogFilesDetails> = await this.getLogFilesNames(since);
      let totalLatest: Date = new Date(0);

      await Promise.all(
        files.map(async (file: DescribeDBLogFilesDetails) =>
          this.scanLogContent(file.LogFileName, since, (digest: Array<[Date, Array<string>]>, latest: Date) => {
            totalLatest = new Date(Math.max(latest.getTime(), totalLatest.getTime()));
            digest.forEach((record: [Date, Array<string>]) => {
              record[1].forEach((dbUsername: string) => {
                if (!this.usersToIgnore.includes(dbUsername)) {
                  if (!minutesTable.has(record[0].getTime())) {
                    minutesTable.set(record[0].getTime(), new Set());
                  }
                  minutesTable.get(record[0].getTime()).add(dbUsername);
                }
              });
            });
          }),
        ),
      );

      const hoursTable: Map<number, Map<string, number>> = this.splitHours(minutesTable);

      const finalCount: Record<string, QueryCount> = {};
      members.forEach((member: Member) => {
        finalCount[member.dbUsername] = { username: member.username, inserts: {} };
      });

      for (const [hour, map] of hoursTable) {
        for (const [dbUsername, count] of map) {
          const sum: number = (finalCount[dbUsername].inserts[hour] || 0) + count;
          finalCount[dbUsername].inserts[hour] = sum;
        }
      }

      const dbQueries: Array<DbQueries> = [];
      Object.values(finalCount)
        .filter((queryCount: QueryCount) => !!Object.keys(queryCount.inserts).length)
        .forEach((queryCount: QueryCount) => {
          Object.entries(queryCount.inserts).forEach(([hour, count]: [string, number]) => {
            dbQueries.push({
              member: queryCount.username,
              dateTime: new Date(parseInt(hour)),
              queries: count,
            });
          });
        });

      await this.persist(dbQueries, totalLatest);

      setTimeout(() => {
        console.debug(`${new Date().toDateString()} re-scan...`);
        this.scan();
      }, 60000);
    })();
  }
}
