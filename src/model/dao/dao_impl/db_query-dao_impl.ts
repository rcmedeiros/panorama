import { DbQueries, DbQueryDAO } from '../..';

import { BaseDbDAOImpl } from './base_db-dao_impl';

export class DbQueryDAOImpl extends BaseDbDAOImpl implements DbQueryDAO {
  public async insertQueries(_queries: DbQueries): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
