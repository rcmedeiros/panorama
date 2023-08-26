import { RedisAdapter } from './redis';

type TestObj = {
  startDate: Date;
  currentCount: number;
};

export class MinuteCounter {
  private static readonly OBJ: string = `${process.env.NODE_ENV}_TEST`;
  private readonly redis: RedisAdapter;

  public constructor() {
    this.redis = RedisAdapter.getInstance();

    this.redis
      .connect()
      .then(() => {
        void this.redis.setJson(MinuteCounter.OBJ, {
          startDate: new Date(),
          currentCount: 0,
        });
        console.debug('start');
        setTimeout(() => {
          void this.count();
        }, 60000);
      })
      .catch(console.error);
  }

  private async count(): Promise<void> {
    console.debug('increment');
    const obj: TestObj = (await this.redis.getJson(MinuteCounter.OBJ)) as TestObj;
    obj.currentCount++;
    await this.redis.setJson(MinuteCounter.OBJ, obj);
    setTimeout(() => {
      void this.count();
    }, 60000);
  }

  public async current(): Promise<Date> {
    const o: TestObj = (await this.redis.getJson(MinuteCounter.OBJ)) as TestObj;
    const result: Date = new Date(o.startDate);
    result.setTime(result.getTime() + o.currentCount * 60000);
    return result;
  }
}
