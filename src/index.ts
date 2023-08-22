import * as core from 'express-serve-static-core';

import { Rejection, Resolution } from './types';
import express, { Request, Response } from 'express';

import compression from 'compression';
import cors from 'cors';
import figlet from 'figlet';
import fs from 'fs';
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

app.get('/', (req: Request, res: Response) => {
  res.send(fs.readFileSync('./templates/index.html').toString());
});

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
