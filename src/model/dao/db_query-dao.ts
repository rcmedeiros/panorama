import { BaseDAO, DbQueries } from '..';

import { SQLTransaction } from '../../adapters';

export interface DbQueryDAO extends BaseDAO {
  registerCounts(queries: DbQueries, transaction: SQLTransaction): Promise<void>;
}
