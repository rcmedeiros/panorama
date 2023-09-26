import { DTO } from './dto';
import { DbQueries } from '..';

export class DbQueriesDTO extends DTO implements DbQueries {
  private _id: number;
  private _member: string;
  private _datetime: Date;
  private _queries: number;

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

  public get datetime(): Date {
    return this._datetime;
  }
  public set datetime(value: Date) {
    this._datetime = value;
  }

  public get queries(): number {
    return this._queries;
  }
  public set queries(value: number) {
    this._queries = value;
  }
}
