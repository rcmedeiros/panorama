import { GitlabEvent } from '../entity';

export interface GitlabDAO {
  getTodaysEvents(userId: number): Promise<Array<GitlabEvent>>;
}
