import { Pool, PoolClient } from 'pg';
import { Rejection, Resolution } from '../types';

import { QueryObject } from './query_object';
import { SQLTransaction } from './sql_transaction';

export class PostgreSQLAdapter {
  private static instance: PostgreSQLAdapter;

  private readonly _pool: Pool;
  private _ready: boolean = false;

  private constructor(connectionString: string) {
    this._pool = new Pool({
      max: 2,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 15000,
      connectionString,
    });
    this._pool.connect((err: Error, _client: PoolClient, done: (release?: unknown) => void) => {
      if (err) throw err;
      done();
      this._ready = true;
      console.info(`PostgreSQL connection opened.`);
    });

    this._pool.on('error', (err: Error, _client: unknown) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  public static getInstance(connectionString: string): PostgreSQLAdapter {
    if (!this.instance) this.instance = new PostgreSQLAdapter(connectionString);
    return this.instance;
  }

  public createTransaction(): SQLTransaction {
    return new SQLTransaction(this._pool);
  }

  public async executeQuery(query: QueryObject): Promise<number | Array<unknown>> {
    return this.execute(query as unknown as string);
  }

  public async execute(sql: string, parameters?: Array<unknown>): Promise<Array<unknown> | number> {
    return new Promise<Array<unknown> | number>((resolve: Resolution<Array<unknown> | number>, reject: Rejection) => {
      void (async (): Promise<void> => {
        try {
          resolve((await this._pool.query(sql, parameters)).rows as Array<unknown>);
        } catch (e) {
          const err: Error = e;
          reject(err);
        }
      })();
    });
  }

  public get ready(): boolean {
    return this._ready;
  }
}
