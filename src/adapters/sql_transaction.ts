import { Pool, PoolClient, QueryResultRow } from 'pg';

import { QueryObject } from './query_object';

export class SQLTransaction {
  private readonly pool: Pool;
  private client: PoolClient;

  public constructor(pool: Pool) {
    this.pool = pool;
  }

  public async begin(): Promise<void> {
    this.client = await this.pool.connect();
    await this.client.query('BEGIN');
  }

  public async execute(query: string, parameters?: Array<unknown>): Promise<Array<unknown> | number> {
    const result: QueryResultRow = await this.client.query(query, parameters);
    return result.rows as Array<unknown> | number;
  }

  public async executeQuery(queryObject: QueryObject): Promise<number | Array<unknown>> {
    return this.execute(queryObject as unknown as string);
  }

  public async rollback(): Promise<void> {
    try {
      await this.client.query('ROLLBACK');
    } finally {
      this.client.release();
    }
  }

  public async commit(): Promise<void> {
    try {
      await this.client.query('COMMIT');
    } finally {
      this.client.release();
    }
  }
}
