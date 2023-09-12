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
            ,m.db_username
            ,m.office365_username
          from
            main.member m
          ${onlyMonitored ? 'where m.monitored = true' : ''}
        `,
      values: undefined,
    })) as Array<unknown>;

    return users.map((r: unknown) => new MemberDTO(r));
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
    const rows: Array<unknown> = (await this.db.executeQuery({
      name: 'getMembersStatus',
      text: `
        select
          username,
          name,
          member,
          file_name,
          project,
          timestamp
        from
          main.current_status
        `,
      values: [],
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
