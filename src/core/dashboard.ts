import { DataAccessFactory, LocalFile, Member, MemberDAO, StatsArgs, Tuple } from '../model';

export class Dashboard {
  private readonly memberDAO: MemberDAO;
  private readonly empty: Tuple<number, 24> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  public constructor() {
    this.memberDAO = DataAccessFactory.getMemberDAO();
  }

  public async getStats(): Promise<Array<StatsArgs>> {
    const members: Array<Member> = await this.memberDAO.getMembersStats();
    const result: Array<StatsArgs> = [];

    members.forEach((member: Member) => {
      const vscode: Tuple<number, 24> = [...this.empty];
      member.localFiles.forEach((lf: LocalFile) => {
        vscode[lf.timestamp.getHours()]++;
      });

      const statsArgs: StatsArgs = {
        username: member.username,
        name: member.name,
        vscode,
      };

      result.push(statsArgs);
    });

    return result;
  }
}
