import { Request, Response } from 'express';

import { RequestHandler } from 'express-serve-static-core';
import { format } from 'date-fns';
import fs from 'fs';
import util from 'util';

export class Dashboard {
  public static route(): RequestHandler {
    return (_request: Request, response: Response): void => {
      response.send(util.format(fs.readFileSync('./templates/index.html').toString(), format(new Date(), 'yyyy-MM-dd HH:mm')));
    };
  }
}
