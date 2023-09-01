import { OneDriveAuth } from './one_drive_auth';
import { OneDriveDAO } from '../one_drive';
import needle from 'needle';

export class OneDriveDAOImpl implements OneDriveDAO {
  private readonly auth: OneDriveAuth;

  public constructor() {
    this.auth = new OneDriveAuth();
  }

  public async getToken(): Promise<string> {
    return this.auth.getToken();
  }

  public async getUserId(username: string): Promise<string> {
    const {
      body: { id },
    }: { body: { id: string } } = await needle('get', `https://graph.microsoft.com/v1.0/users/${username}`, undefined, {
      headers: { Authorization: `Bearer ${await this.auth.getToken()}` },
    });

    return id;
  }
  public async getUserDrive(userId: string): Promise<string> {
    const {
      body: { id },
    }: { body: { id: string } } = await needle('get', `https://graph.microsoft.com/v1.0/users/${userId}/drive`, undefined, {
      headers: { Authorization: `Bearer ${await this.auth.getToken()}` },
    });

    return id;
  }
}
