import { DbQueries, DbQueryDAO } from '../..';

import { BaseDbDAOImpl } from './base_db-dao_impl';
import { SQLTransaction } from '../../../adapters';

export class DbQueryDAOImpl extends BaseDbDAOImpl implements DbQueryDAO {
  public async registerCounts(queries: DbQueries, transaction: SQLTransaction): Promise<void> {
    const rows: Array<Record<string, number>> = (await transaction.executeQuery({
      name: 'dbQueries.getCount',
      text: 'SELECT dq.queries from main.db_queries dq where dq."member" = $1 and dq.datetime = $2',
      values: [queries.member, queries.datetime],
    })) as Array<Record<string, number>>;

    if (rows.length) {
      queries.queries += rows[0].queries;

      await transaction.executeQuery({
        name: 'dbQueries.updateCount',
        text: 'UPDATE main.db_queries SET queries=$3 WHERE "member"=$1 AND datetime=$2',
        values: [queries.member, queries.datetime, queries.queries],
      });
    } else {
      await transaction.executeQuery({
        name: 'dbQueries.insertCount',
        text: 'INSERT INTO main.db_queries ("member", datetime, queries) VALUES($1, $2, $3)',
        values: [queries.member, queries.datetime, queries.queries],
      });
    }
  }
}
