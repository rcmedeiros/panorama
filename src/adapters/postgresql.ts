import { Pool, PoolClient } from 'pg';
import { Rejection, Resolution } from '../types';

export class PostgreSQLAdapter {
  private static instance: PostgreSQLAdapter;

  private _pool: Pool;

  private constructor() {
    /* singleton */
  }

  public static getInstance(): PostgreSQLAdapter {
    if (!this.instance) this.instance = new PostgreSQLAdapter();
    return this.instance;
  }

  public async connect(): Promise<void> {
    return new Promise<void>((resolve: Resolution<void>, reject: Rejection) => {
      void (async (): Promise<void> => {
        try {
          if (!this._pool) {
            this._pool = new Pool({
              max: 2,
              idleTimeoutMillis: 60000,
              connectionTimeoutMillis: 15000,
              connectionString: process.env.DB,
            });
            this._pool.connect((err: Error, _client: PoolClient, done: (release?: unknown) => void) => {
              if (err) {
                reject(err);
              } else {
                done();
                console.info(`PostgreSQL connection opened.`);
                resolve();
              }
            });

            this._pool.on('error', (err: Error, _client: unknown) => {
              console.error('Unexpected error on idle client', err);
            });
          }
        } catch (e) {
          reject(new Error(e));
        }
      })();
    });
  }

  public get pool(): Pool {
    return this._pool;
  }
}
