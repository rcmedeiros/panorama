import * as redis from 'redis';

import { Rejection, Resolution } from '../types';

type RedisClient = ReturnType<typeof redis.createClient>;

export class RedisAdapter {
  private static instance: RedisAdapter;

  private client: RedisClient;

  private constructor() {
    /* singleton */
  }

  public static getInstance(): RedisAdapter {
    if (!this.instance) this.instance = new RedisAdapter();
    return this.instance;
  }

  public async connect(): Promise<void> {
    return new Promise<void>((resolve: Resolution<void>, reject: Rejection) => {
      void (async (): Promise<void> => {
        try {
          if (!this.client?.isOpen) {
            this.client = redis.createClient({ url: process.env.CACHE });
            await this.client.connect();
            this.client.on('error', (err: Error) => {
              console.error('Redis Client Error', err);
            });
            resolve();
          }
        } catch (e) {
          reject(new Error(e));
        }
      })();
    });
  }

  public async getJson(key: string): Promise<object> {
    return JSON.parse(await this.client.get(key)) as object;
  }

  public async setJson(key: string, value: object): Promise<void> {
    if (value) {
      await this.client.set(key, JSON.stringify(value));
    }
  }

  public async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = undefined;
    }
  }

  public isReady(): boolean {
    return this.client?.isReady;
  }
}
