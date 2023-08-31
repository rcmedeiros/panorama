import * as core from 'express-serve-static-core';

import { Rejection, Resolution } from './types';
import express, { NextFunction, Request, Response } from 'express';

import { Dashboard } from './pages/dashboard';
import { LocalFiles } from './workers/local_files';
import compression from 'compression';
import cors from 'cors';
import crypto from 'crypto';
import figlet from 'figlet';
import helmet from 'helmet';
import { isProduction } from './helpers';

const app: core.Express = express();
app.use(express.static('static'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw());
app.use(compression());

app.use((_request: Request, response: Response, next: NextFunction) => {
  response.locals.cspNonce = crypto.randomBytes(16).toString('hex');
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        scriptSrc: ["'self'", (_request: Request, response: Response): string => `'nonce-${response.locals.cspNonce}'`],
      },
    },
  }),
);
app.use(express.json());
app.use(cors());
app.set('port', 80);

app.get('*', Dashboard.route);

if (isProduction()) {
  console.debug = (): void => {
    /* disable */
  };
}

const localFiles: LocalFiles = new LocalFiles();

const started: Promise<core.Express> = new Promise((resolve: Resolution<core.Express>, reject: Rejection): void => {
  void (async (): Promise<void> => {
    app
      .listen(80)
      .once('listening', () => {
        localFiles.start();
        resolve(app);
        console.info(
          figlet.textSync('Panorama', {
            font: 'Star Wars',
            horizontalLayout: 'default',
            verticalLayout: 'default',
          }),
        );
      })
      .once('error', (e: Error) => {
        reject(e);
      });
  })();
});

export { started };
