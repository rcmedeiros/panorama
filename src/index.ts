import * as core from 'express-serve-static-core';

import { Rejection, Resolution } from './types';
import express, { Request, Response } from 'express';

import { MinuteCounter } from './minute_counter';
import compression from 'compression';
import cors from 'cors';
import figlet from 'figlet';
import { format } from 'date-fns';
import fs from 'fs';
import helmet from 'helmet';
import util from 'util';

const app: core.Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw());
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(cors());
app.set('port', 80);

let counter: MinuteCounter;

app.get('/', (req: Request, res: Response) => {
  void (async (): Promise<void> => {
    res.send(
      util.format(
        fs.readFileSync('./templates/index.html').toString(),
        format(new Date(), 'yyyy-MM-dd HH:mm'),
        format(await counter.current(), 'yyyy-MM-dd HH:mm'),
      ),
    );
  })();
});

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
        counter = new MinuteCounter();
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
