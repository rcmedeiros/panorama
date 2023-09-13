import { DataAccessFactory, GitlabDAO, GitlabEvent, LocalFile, Member, MemberDAO, StatsArgs, Tuple } from '../model';

export class Dashboard {
  private readonly memberDAO: MemberDAO;
  private readonly gitlabDAO: GitlabDAO;
  private readonly empty: Tuple<number, 24> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  public constructor() {
    this.memberDAO = DataAccessFactory.getMemberDAO();
    this.gitlabDAO = DataAccessFactory.getGitlabDAO();
  }

  public async getStats(): Promise<Array<StatsArgs>> {
    const members: Array<Member> = await this.memberDAO.getMembersStats();
    const result: Array<StatsArgs> = [];

    const gitlabEvents: Array<Array<GitlabEvent>> = await Promise.all(members.map(async (m: Member) => this.gitlabDAO.getTodaysEvents(m.gitlabId)));

    members.forEach((member: Member, idx: number) => {
      const vscode: Tuple<number, 24> = [...this.empty];
      const vscodeLabels: Set<string> = new Set();
      member.localFiles.forEach((lf: LocalFile) => {
        vscode[lf.timestamp.getHours()]++;
        vscodeLabels.add(lf.project);
      });

      const gitEvents: Tuple<number, 24> = [...this.empty];
      gitlabEvents[idx].forEach((e: GitlabEvent) => {
        gitEvents[e.created_at.getHours()]++;
      });

      const statsArgs: StatsArgs = {
        username: member.username,
        name: member.name,
        vscode,
        vscodeLabels: Array.from(vscodeLabels).join('|'),
        gitEvents,
      };

      result.push(statsArgs);
    });

    return result;
  }
}
