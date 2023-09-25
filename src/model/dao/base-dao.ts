import { SQLTransaction } from '../../adapters';

export interface BaseDAO {
  isReady(): Promise<void>;
  createTransaction(): SQLTransaction;
}
