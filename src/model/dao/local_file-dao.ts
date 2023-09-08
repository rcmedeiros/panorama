import { BaseDAO, LocalFile } from '..';

export interface LocalFileDAO extends BaseDAO {
  insertFile(file: LocalFile): Promise<void>;
  getPeriodByMember(begin: Date, end: Date): Promise<{ [member: string]: Array<LocalFile> }>;
}
