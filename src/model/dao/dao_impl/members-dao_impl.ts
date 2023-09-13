import { LocalFileDTO, Member, MemberDAO, MemberDTO } from '../..';

import { BaseDbDAOImpl } from './base_db-dao_impl';

export class MemberDAOImpl extends BaseDbDAOImpl implements MemberDAO {
  private readMember(row: Record<string, unknown>, currMember: Member, result: Array<Member>): Member {
    if (row.username !== currMember.username) {
      currMember = new MemberDTO(row);

      result.push(currMember);
    }

    return currMember;
  }

  private readLocalFile(row: Record<string, unknown>, currMember: Member): void {
    if (row.file_name) {
      currMember.localFiles.push(new LocalFileDTO(row));
    }
  }

  public async getMembers(onlyMonitored?: boolean): Promise<Array<Member>> {
    const users: Array<unknown> = (await this.db.executeQuery({
      name: 'getMonitoredUsers',
      text: `
          select
            m.username
            ,m.monitored
            ,m.name
            ,m.drive_id
            ,m.delta_link
            ,m.db_username
            ,m.office365_username
            ,m.gitlab_id
          from
            main.member m
          ${onlyMonitored ? 'where m.monitored = true' : ''}
        `,
      values: undefined,
    })) as Array<unknown>;

    return users.map((r: unknown) => new MemberDTO(r));
  }

  public async updateDeltaLink(username: string, deltaLink: string): Promise<void> {
    await this.db.executeQuery({
      name: 'updateDeltaLink',
      text: `
        update main.member set delta_link = $1 where username = $2
        `,
      values: [deltaLink, username],
    });
  }

  public async setupDrive(member: Member): Promise<void> {
    await this.db.executeQuery({
      name: 'setupMemberDrive',
      text: `
          update
            main.member
            set drive_id = $2
          where username = $1
        `,
      values: [member.username, member.driveId],
    });
  }

  public async getMembersStats(): Promise<Array<Member>> {
    const d: Date = new Date();
    d.setHours(0, 0, 0, 0);

    const rows: Array<unknown> = (await this.db.executeQuery({
      name: 'getMembersStatus',
      text: `
        SELECT m.username,
            m.name,
            lf.member,
            lf.file_name,
            lf.project,
            lf."timestamp",
            m.gitlab_id
          FROM main.member m
            LEFT JOIN main.local_file lf ON m.monitored IS TRUE AND lf.member::text = m.username::text AND lf."timestamp" >= $1
          ORDER BY m.username, lf."timestamp";
        `,
      values: [d],
    })) as Array<unknown>;

    const result: Array<Member> = [];

    let currMember: Member = new MemberDTO();

    rows.forEach((row: Record<string, unknown>) => {
      currMember = this.readMember(row, currMember, result);
      this.readLocalFile(row, currMember);
    });

    return result;
  }
}
