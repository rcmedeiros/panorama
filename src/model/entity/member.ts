import { LocalFile } from './local_file';

export interface Member {
  username: string;
  monitored: boolean;
  name: string;
  dbUsername?: string;
  office365Username?: string;
  driveId?: string;
  deltaLink?: string;
  gitlabId: number;
  localFiles?: Array<LocalFile>;
}
