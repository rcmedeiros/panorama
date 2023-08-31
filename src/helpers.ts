import { Resolution } from './types';

export const isProduction: () => boolean = () => process.env.NODE_ENV?.toUpperCase().startsWith('PROD');

export const waitWhile: (statement: () => boolean, pace?: number) => Promise<void> = async (statement: () => boolean, pace?: number): Promise<void> => {
  pace = pace || 1;
  return new Promise((resolve: Resolution<void>) => {
    void (async (): Promise<void> => {
      while (statement()) {
        await new Promise((tick: Resolution<void>) => {
          setTimeout(() => {
            tick();
          }, pace);
        });
      }
      resolve();
    })();
  });
};

export const waitUntil: (statement: () => boolean, pace?: number) => Promise<void> = async (statement: () => boolean, pace?: number): Promise<void> => {
  return waitWhile(() => !statement(), pace);
};

export const waitFor: (milliseconds: number) => Promise<void> = async (milliseconds: number): Promise<void> => {
  await new Promise((resolve: Resolution<void>) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
};
