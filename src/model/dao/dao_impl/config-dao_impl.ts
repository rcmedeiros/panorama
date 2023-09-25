import { BaseDbDAOImpl } from './base_db-dao_impl';
import { ConfigDAO } from '../config-dao';
import { SQLTransaction } from '../../../adapters';

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

  public async set(name: string, value: string, transaction?: SQLTransaction): Promise<void> {
    await (transaction || this.db).executeQuery({
      name: 'config.set',
      text: 'insert into main.config (name, value) values ($1, $2) on conflict (name) do update set value = excluded.value',
      values: [name, value],
    });
  }
}
