import { OneDriveChildren, OneDriveItem } from '..';

export type Delta = {
  values: Array<OneDriveItem>;
  deltaLink: string;
};

export interface OneDriveDAO {
  getUserId(username: string): Promise<string>;
  getUserDrive(userId: string): Promise<string>;
  getToken(): Promise<string>;
  getChildren(driveId: string, id: string): Promise<OneDriveChildren>;
  getFileContent(driveId: string, fileId: string): Promise<unknown>;
  getDelta(driveId: string, delta: string): Promise<Delta>;
}
