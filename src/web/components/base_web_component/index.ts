import fs from 'fs';
import path from 'path';

type Prototype = { constructor: { name: string } };

export class BaseWebComponent {
  private readonly regex: RegExp = new RegExp(/{{(.*?)}}/g);
  private readonly content: string;

  public constructor() {
    const className: string = (Object.getPrototypeOf(this) as Prototype).constructor.name;
    const stackLine: string = new Error().stack.split('\n').filter((l: string) => l.startsWith(`    at new ${className}`))[0];
    console.info('--------------------');
    console.info(new Error().stack.split('\n').filter((l: string) => l.startsWith(`    at new ${className}`)));
    console.info('--------------------');
    console.info(stackLine);
    console.info('--------------------');
    console.info(stackLine.match(/\((.*?)\\([^\\]*)\)/)[1]);
    console.info('--------------------');
    this.content = fs.readFileSync(path.join(stackLine.match(/\((.*?)\\([^\\]*)\)/)[1], 'index.html')).toString();
  }

  protected getContent(variables: Record<string, string>): string {
    return this.content.replace(this.regex, (_: string, ...args: Array<string>): string => {
      return variables[args[0]];
    });
  }
}
