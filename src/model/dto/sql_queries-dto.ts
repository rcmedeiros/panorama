import { DTO } from './dto';
import { SqlQueries } from '..';

export class SqlQueriesDTO extends DTO implements SqlQueries {
  private _id: number;
  private _member: string;
  private _queries: number;
  private _dateTime: Date;

  public get id(): number {
    return this._id;
  }
  public set id(value: number) {
    this._id = value;
  }

  public get member(): string {
    return this._member;
  }
  public set member(value: string) {
    this._member = value;
  }

  public get queries(): number {
    return this._queries;
  }
  public set queries(value: number) {
    this._queries = value;
  }

  public get dateTime(): Date {
    return this._dateTime;
  }
  public set dateTime(value: Date) {
    this._dateTime = value;
  }
}
