export interface OneDriveDAO {
  getUserId(username: string): Promise<string>;
  getUserDrive(userId: string): Promise<string>;
  getToken(): Promise<string>;
}
