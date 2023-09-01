import { Member, MemberDAO, MemberDTO } from '../..';

import { BaseDbDAOImpl } from './base_db-dao_impl';

export class MemberDAOImpl extends BaseDbDAOImpl implements MemberDAO {
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
}
