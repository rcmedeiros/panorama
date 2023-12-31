import { LocalFile, LocalFileDAO } from '../..';

import { BaseDbDAOImpl } from './base_db-dao_impl';

export class LocalFileDAOImpl extends BaseDbDAOImpl implements LocalFileDAO {
  public async insertFile(file: LocalFile): Promise<void> {
    if (file.project) {
      await this.db.executeQuery({
        name: 'insertLocalFiles',
        text: 'INSERT INTO main.local_file ("member", file_name, project, timestamp) VALUES($1, $2, $3, $4);',
        values: [file.member, file.fileName, file.project, file.timestamp],
      });
    }
  }
}
