import { BaseDAO, Member } from '..';

export interface MemberDAO extends BaseDAO {
  getMembers(onlyMonitored?: boolean): Promise<Array<Member>>;
  getMembersStats(): Promise<Array<Member>>;
  setupDrive(member: Member): Promise<void>;
}
