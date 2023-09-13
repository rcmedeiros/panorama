import { LocalFile, LocalFileDAO } from '../..';

import { BaseDbDAOImpl } from './base_db-dao_impl';

export class LocalFileDAOImpl extends BaseDbDAOImpl implements LocalFileDAO {
  public async insertFile(file: LocalFile): Promise<void> {
    await this.db.executeQuery({
      name: 'insertLocalFiles',
      text: 'INSERT INTO main.local_file ("member", file_name, timestamp) VALUES($1, $2, $3);',
      values: [file.member, file.fileName, file.timestamp],
    });
  }
}
