import { DTO } from './dto';
import { LocalFile } from '..';

export class LocalFileDTO extends DTO implements LocalFile {
  private _id: number;
  private _member: string;
  private _fileName: string;
  private _project: string;
  private _timestamp: Date;

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

  public get fileName(): string {
    return this._fileName;
  }
  public set fileName(value: string) {
    this._fileName = value;
  }

  public get project(): string {
    return this._project;
  }
  public set project(value: string) {
    this._project = value;
  }

  public get timestamp(): Date {
    return this._timestamp;
  }
  public set timestamp(value: Date) {
    this._timestamp = value;
  }
}
