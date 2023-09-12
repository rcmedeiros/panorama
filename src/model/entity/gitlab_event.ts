import { GitlabEventAuthor } from './gitlab_event_author';

export interface GitlabEvent {
  id: number;
  action_name: string;
  created_at: Date;
  author: GitlabEventAuthor;
}
