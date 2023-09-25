import { BaseDAO } from '..';
import { SQLTransaction } from '../../adapters';

export interface ConfigDAO extends BaseDAO {
  getAll(): Promise<Array<[string, string]>>;
  set(name: string, value: string, transaction?: SQLTransaction): Promise<void>;
}
