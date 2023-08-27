import * as core from 'express-serve-static-core';

import { Rejection, Resolution } from './types';

import { Dashboard } from './pages/dashboard';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import figlet from 'figlet';
import helmet from 'helmet';

const app: core.Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw());
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(cors());
app.set('port', 80);

app.use(express.static('static'));

app.get('*', Dashboard.route);

if (process.env.NODE_ENV?.toUpperCase().startsWith('PROD')) {
  console.debug = (): void => {
    /* disable */
  };
}

const started: Promise<core.Express> = new Promise((resolve: Resolution<core.Express>, reject: Rejection): void => {
  void (async (): Promise<void> => {
    app
      .listen(80)
      .once('listening', () => {
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
