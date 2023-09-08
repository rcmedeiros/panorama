import { DataAccessFactory, LocalFile, LocalFileDAO } from '../../../model';

import { BaseWebPage as WebPage } from '../base_web_page';

export class Dashboard extends WebPage {
  private readonly localFileDAO: LocalFileDAO;

  public constructor() {
    super();
    this.localFileDAO = DataAccessFactory.getLocalFileDAO();
  }

  protected async getVariables(): Promise<Record<string, string>> {
    const begin: Date = new Date();
    begin.setHours(0);
    begin.setMinutes(0);
    begin.setSeconds(0);
    begin.setMilliseconds(0);
    const end: Date = new Date(begin);
    end.setDate(end.getDate() + 1);

    const data: { [member: string]: Array<LocalFile> } = await this.localFileDAO.getPeriodByMember(begin, end);
    const [memberName, localFiles] = Object.entries(data)[0];
    const streak: Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    localFiles.forEach((lf: LocalFile) => {
      streak[lf.timestamp.getHours()]++;
    });

    return { memberName, streak: JSON.stringify(streak) };
  }
}
