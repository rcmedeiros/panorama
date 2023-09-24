import { BaseDAO, DbQueries } from '..';

export interface DbQueryDAO extends BaseDAO {
  insertQueries(queries: DbQueries): Promise<void>;
}
