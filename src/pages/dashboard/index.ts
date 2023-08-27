import { Request, Response } from 'express';

import { RequestHandler } from 'express-serve-static-core';
import fs from 'fs';
import path from 'path';
import util from 'util';

export class Dashboard {
  public static route: RequestHandler = (_request: Request, response: Response): void => {
    response.send(util.format(fs.readFileSync(path.join(__dirname, 'index.html')).toString()));
  };
}
