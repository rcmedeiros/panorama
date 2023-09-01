import { SQLQueryDAO, SqlQueries } from '../..';

import { BaseDbDAOImpl } from './base_db-dao_impl';

export class SQLQueryDAOImpl extends BaseDbDAOImpl implements SQLQueryDAO {
  public async insertQueries(_queries: SqlQueries): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
