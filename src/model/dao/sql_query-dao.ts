import { BaseDAO, SqlQueries } from '..';

export interface SQLQueryDAO extends BaseDAO {
  insertQueries(queries: SqlQueries): Promise<void>;
}
