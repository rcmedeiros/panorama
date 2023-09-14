/* eslint-disable no-null/no-null */
import { DataAccessFactory, Member, MemberDAO } from '../../model';
import {
  DescribeDBLogFilesCommand,
  DescribeDBLogFilesCommandOutput,
  DescribeDBLogFilesDetails,
  DownloadDBLogFilePortionCommand,
  DownloadDBLogFilePortionCommandOutput,
  RDSClient,
} from '@aws-sdk/client-rds';

type Counter = { dbUsername?: string; username: string; counter: number };

export class SQLLogScanner {
  private static readonly REGEX = new RegExp(/([^:]+)(?=@orchestra:)/g);
  private static readonly SYS_USERS_TO_IGNORE = process.env.DB_SYS_USERS_TO_IGNORE ? process.env.DB_SYS_USERS_TO_IGNORE.split(',') : [];
  private readonly memberDAO: MemberDAO;
  private readonly client: RDSClient;

  public constructor() {
    this.memberDAO = DataAccessFactory.getMemberDAO();
    this.client = new RDSClient({ region: process.env.DB_REGION });
  }

  private async getLogFilesNames(since: Date, marker?: string): Promise<Array<DescribeDBLogFilesDetails>> {
    const response: DescribeDBLogFilesCommandOutput = await this.client.send(
      new DescribeDBLogFilesCommand({
        DBInstanceIdentifier: process.env.DB_INSTANCE,
        FileLastWritten: since.getTime(),
        Marker: marker,
      }),
    );

    if (response.Marker) {
      response.DescribeDBLogFiles = response.DescribeDBLogFiles.concat(await this.getLogFilesNames(since, response.Marker));
    }

    return response.DescribeDBLogFiles;
  }

  private async scanLogContent(fileName: string, matcher: (content: string) => void, marker?: string): Promise<void> {
    console.debug(`${fileName} @ ${marker}`);
    const response: DownloadDBLogFilePortionCommandOutput = await this.client.send(
      new DownloadDBLogFilePortionCommand({
        DBInstanceIdentifier: process.env.DB_INSTANCE,
        LogFileName: fileName,
        NumberOfLines: 10000,
        Marker: marker || '0',
      }),
    );

    matcher(response.LogFileData);

    if (response.AdditionalDataPending) {
      await this.scanLogContent(fileName, matcher, response.Marker);
    }
  }

  public scan(): void {
    return;
    void (async (): Promise<void> => {
      await this.memberDAO.isReady();

      const members: Array<Member> = await this.memberDAO.getMembers(true);

      const counters: { [dbUsername: string]: Counter } = {};
      members.forEach((member: Member) => {
        counters[member.dbUsername] = { username: member.username, counter: 0 };
      });

      console.debug('Starting SQL monitoring...');

      const since: Date = new Date();
      since.setHours(since.getHours() - 1);

      const files: Array<DescribeDBLogFilesDetails> = await this.getLogFilesNames(since);
      await Promise.all(
        files.map(async (file: DescribeDBLogFilesDetails) =>
          this.scanLogContent(file.LogFileName, (content: string) => {
            const matches: Array<string> = [];
            let match: RegExpExecArray;
            while ((match = SQLLogScanner.REGEX.exec(content)) !== null) {
              if (!SQLLogScanner.SYS_USERS_TO_IGNORE.includes(match[1])) matches.push(match[1]);
            }

            matches.forEach((dbUsername: string) => {
              counters[dbUsername].counter++;
            });
          }),
        ),
      );

      console.debug(JSON.stringify(counters, null, 4));
    })();
  }
}
