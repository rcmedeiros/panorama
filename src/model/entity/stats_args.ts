import { Tuple } from './tuple';

export type StatsArgs = {
  username: string;
  name: string;
  vscode: Tuple<number, 24>;
  vscodeLabels: string;
  gitEvents?: Tuple<number, 24>;
  dbQueries?: Tuple<number, 24>;
  aws?: Tuple<number, 24>;
  teams?: Tuple<number, 24>;
};
