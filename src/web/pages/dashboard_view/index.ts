import { CollectionComponent, StatsRowComponent } from '../../components';

import { BaseWebPage } from '../base_web_page';
import { Dashboard } from '../../../core';
import { StatsArgs } from '../../../model';

export class DashboardView extends BaseWebPage {
  private readonly dashboard = new Dashboard();

  protected async getVariables(): Promise<Record<string, string>> {
    const args: Array<StatsArgs> = await this.dashboard.getStats();

    const collection: CollectionComponent = new CollectionComponent(args.map((arg: StatsArgs) => new StatsRowComponent(arg)));

    return { statsRows: collection.getContent(), statsScripts: collection.getScript() };
  }
}
