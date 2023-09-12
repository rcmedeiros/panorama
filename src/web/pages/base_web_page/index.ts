import { Request, Response } from 'express';

import { RequestHandler } from 'express-serve-static-core';
import fs from 'fs';
import path from 'path';

type Prototype = { constructor: { name: string } };

export abstract class BaseWebPage {
  private readonly contentRegex: RegExp = new RegExp(/{{(.*?)}}/g);
  private readonly pathRegex: RegExp = process.platform === 'win32' ? new RegExp(/\((.*?)\\([^\\]*)\)/) : new RegExp(/\((.*?)\/([^/]*)\)/);
  private readonly content: string;

  public constructor() {
    const className: string = (Object.getPrototypeOf(this) as Prototype).constructor.name;
    const stackLine: string = new Error().stack.split('\n').filter((l: string) => l.startsWith(`    at new ${className}`))[0];
    this.content = fs.readFileSync(path.join(stackLine.match(this.pathRegex)[1], 'index.html')).toString();
  }

  protected getContent(variables: Record<string, string>): string {
    return this.content.replace(this.contentRegex, (_: string, ...args: Array<string>): string => {
      return variables[args[0]];
    });
  }

  public route: RequestHandler = (_request: Request, response: Response): void => {
    void (async (): Promise<void> => {
      response.send(this.getContent(await this.getVariables()).replace(/<script>/gi, `<script nonce="${response.locals.cspNonce}">`));
    })();
  };

  protected abstract getVariables(): Promise<Record<string, string>>;
}
