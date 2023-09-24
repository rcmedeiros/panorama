import { BaseDbDAOImpl } from './base_db-dao_impl';
import { ConfigDAO } from '../config-dao';

type NameValue = { name: string; value: string };

export class ConfigDAOImpl extends BaseDbDAOImpl implements ConfigDAO {
  public async getAll(): Promise<Array<[string, string]>> {
    const rows: Array<NameValue> = (await this.db.executeQuery({
      name: 'config.getAll',
      text: 'select name, value from main.config',
      values: [],
    })) as Array<NameValue>;

    return rows.map((r: NameValue) => [r.name, r.value]);
  }

  public async set(name: string, value: string): Promise<void> {
    await this.db.executeQuery({
      name: 'config.set',
      text: 'update main.config set value = $2 where name = $1',
      values: [name, value],
    });
  }
}
