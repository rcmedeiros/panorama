import { GitlabEvent, GitlabProject } from '../../../model';
import needle, { NeedleResponse } from 'needle';

import { Config } from '../../../core';
import { GITLAB_TOKEN } from '../../../constants';
import { GitlabDAO } from '../gitlab-dao';

export class GitlabDAOImpl implements GitlabDAO {
  private readonly API: string = 'https://gitlab.com/api/v4';
  private readonly TOKEN_ARG: string = `private_token=${Config.get(GITLAB_TOKEN)}`;

  public async getTodaysEvents(userId: number): Promise<Array<GitlabEvent>> {
    const d: Date = new Date();
    d.setDate(d.getDate() - 1);

    const strDate: string = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

    const r: NeedleResponse = await needle(
      'get',
      `${this.API}/users/${userId}/events?after=${strDate}&per_page=200&${this.TOKEN_ARG}`,
      {
        compressed: true,
        follow_max: 5,
      },
      {
        headers: { 'content-type': 'application/json' },
      },
    );

    const result: Array<GitlabEvent> = r.body as Array<GitlabEvent>;
    result.forEach((element: GitlabEvent) => {
      element.created_at = new Date(element.created_at);
    });

    d.setDate(d.getDate() + 1);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);

    return result.filter((e: GitlabEvent) => e.created_at.getTime() >= d.getTime());
  }

  public async getProjectNames(page: number = 1): Promise<Array<string>> {
    const r: NeedleResponse = await needle(
      'get',
      `${this.API}/projects?page=${page}&simple=true&per_page=100&membership=true&${this.TOKEN_ARG}`,
      {
        compressed: true,
        follow_max: 5,
      },
      {
        headers: { 'content-type': 'application/json' },
      },
    );

    let result: Array<string> = (r.body as Array<GitlabProject>).map((p: GitlabProject) => p.path);
    if (r.headers['x-next-page']) {
      result = result.concat(await this.getProjectNames(parseInt(r.headers['x-next-page'] as string)));
    }

    return result;
  }
}
