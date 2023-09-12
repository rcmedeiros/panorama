import { Tuple } from './tuple';

export type StatsArgs = {
  username: string;
  name: string;
  vscode: Tuple<number, 24>;
  intellij?: Tuple<number, 24>;
  gitEvents?: Tuple<number, 24>;
  sql?: Tuple<number, 24>;
  aws?: Tuple<number, 24>;
  teams?: Tuple<number, 24>;
};
