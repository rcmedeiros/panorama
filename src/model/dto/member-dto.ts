import { DTO } from './dto';
import { Member } from '..';

export class MemberDTO extends DTO implements Member {
  private _username: string;
  private _monitored: boolean;
  private _name: string;
  private _dbUsername: string;
  private _office365Username: string;
  private _driveId: string;

  public get username(): string {
    return this._username;
  }
  public set username(value: string) {
    this._username = value;
  }

  public get monitored(): boolean {
    return this._monitored;
  }
  public set monitored(value: boolean) {
    this._monitored = value;
  }

  public get name(): string {
    return this._name;
  }
  public set name(value: string) {
    this._name = value;
  }

  public get dbUsername(): string {
    return this._dbUsername;
  }
  public set dbUsername(value: string) {
    this._dbUsername = value;
  }

  public get office365Username(): string {
    return this._office365Username;
  }
  public set office365Username(value: string) {
    this._office365Username = value;
  }

  public get driveId(): string {
    return this._driveId;
  }
  public set driveId(value: string) {
    this._driveId = value;
  }
}
