import { PostgreSQLAdapter, SQLTransaction } from '../../../adapters';

import { waitUntil } from '../../../helpers';

export class BaseDbDAOImpl {
  protected readonly db: PostgreSQLAdapter;

  public constructor() {
    this.db = PostgreSQLAdapter.getInstance(process.env.DB);
  }

  public createTransaction(): SQLTransaction {
    return this.db.createTransaction();
  }

  public async isReady(): Promise<void> {
    await waitUntil(() => this.db.ready);
  }
}
