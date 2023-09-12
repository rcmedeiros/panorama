import { WebComponent } from './web_component';

export class CollectionComponent implements WebComponent {
  private readonly components: Array<WebComponent>;

  public constructor(components: Array<WebComponent>) {
    this.components = components;
  }

  public getContent(): string {
    return this.components.map((c: WebComponent) => c.getContent()).join('\n');
  }
  public getScript(): string {
    return this.components.map((c: WebComponent) => c.getScript()).join('\n');
  }
}
