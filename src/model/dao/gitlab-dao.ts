import { GitlabEvent } from '../entity';

export interface GitlabDAO {
  getTodaysEvents(userId: number): Promise<Array<GitlabEvent>>;
  getProjectNames(page?: number): Promise<Array<string>>;
}
