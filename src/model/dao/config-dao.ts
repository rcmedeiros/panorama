import { BaseDAO } from '..';

export interface ConfigDAO extends BaseDAO {
  getAll(): Promise<Array<[string, string]>>;
  set(name: string, value: string): Promise<void>;
}
