import { BaseDAO, LocalFile } from '..';

export interface LocalFileDAO extends BaseDAO {
  insertFile(file: LocalFile): Promise<void>;
}
