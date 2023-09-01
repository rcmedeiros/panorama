import { Delta, OneDriveChildren, OneDriveDAO, OneDriveDelta, OneDriveItem } from '../..';
import needle, { NeedleResponse } from 'needle';

import { OneDriveAuth } from './one_drive_auth';

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

  public async getChildren(driveId: string, id: string): Promise<OneDriveChildren> {
    const { body }: { body: OneDriveChildren } = await needle('get', `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${id}/children`, undefined, {
      headers: { Authorization: `Bearer ${await this.getToken()}` },
    });
    return body;
  }

  public async getFileContent(driveId: string, fileId: string): Promise<unknown> {
    let result: unknown = undefined;
    const content: NeedleResponse = await needle('get', `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/content`, undefined, {
      headers: { Authorization: `Bearer ${await this.auth.getToken()}` },
    });

    if (content.headers?.location) {
      const resp2: NeedleResponse = await needle('get', content.headers.location, undefined, {
        headers: { Authorization: `Bearer ${await this.auth.getToken()}` },
      });
      result = resp2.body;
    }

    return result;
  }

  public async getDelta(driveId: string, delta: string): Promise<Delta> {
    let { body }: { body: OneDriveDelta } = await needle(
      'get',
      `https://graph.microsoft.com/v1.0/drives/${driveId}/root/delta${delta ? `?token=${delta}` : ''}`,
      undefined,
      { headers: { Authorization: `Bearer ${await this.auth.getToken()}` } },
    );

    let result: Array<OneDriveItem> = body.value;

    while (body['@odata.nextLink']) {
      ({ body } = await needle('get', body['@odata.nextLink'], undefined, { headers: { Authorization: `Bearer ${await this.auth.getToken()}` } }));
      result = result.concat(body.value);
    }

    return {
      values: result,
      deltaLink: body['@odata.deltaLink'].substring(body['@odata.deltaLink'].indexOf('?token=') + 7),
    };
  }
}
