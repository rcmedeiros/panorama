import { DTO } from './dto';
import { DbQueries } from '..';

export class DbQueriesDTO extends DTO implements DbQueries {
  private _member: string;
  private _dateTime: Date;
  private _queries: number;

  public get member(): string {
    return this._member;
  }
  public set member(value: string) {
    this._member = value;
  }

  public get dateTime(): Date {
    return this._dateTime;
  }
  public set dateTime(value: Date) {
    this._dateTime = value;
  }

  public get queries(): number {
    return this._queries;
  }
  public set queries(value: number) {
    this._queries = value;
  }
}
