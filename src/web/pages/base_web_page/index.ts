import { Request, Response } from 'express';

import { BaseWebComponent } from '../../components/base_web_component';
import { RequestHandler } from 'express-serve-static-core';

export abstract class BaseWebPage extends BaseWebComponent {
  public route: RequestHandler = (_request: Request, response: Response): void => {
    void (async (): Promise<void> => {
      response.send(this.getContent(await this.getVariables()).replace(/<script>/gi, `<script nonce="${response.locals.cspNonce}">`));
    })();
  };

  protected abstract getVariables(): Promise<Record<string, string>>;
}
