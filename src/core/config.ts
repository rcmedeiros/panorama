import { ConfigDAO, DataAccessFactory } from '../model';

export class Config {
  private static properties: Record<string, string> = {};
  private static readonly dao: ConfigDAO = DataAccessFactory.getConfigDAO();

  public static async init(): Promise<void> {
    await this.dao.isReady();
    (await Config.dao.getAll()).forEach((nameValue: [string, string]) => {
      this.properties[nameValue[0]] = nameValue[1];
    });
  }

  public static get(name: string): string {
    return Config.properties[name] || process.env[name];
  }

  public static async set(name: string, value: string): Promise<void> {
    if (process.env[name]) {
      process.env[name] = value;
    } else {
      await Config.dao.set(name, value);
      this.properties[name] = value;
    }
  }
}
