import { OD_CLIENT_ID, OD_CLIENT_SECRET, OD_TENANT } from '../../../constants/variables';

import { Config } from '../../../core';
import needle from 'needle';

type Login = {
  access_token: string;
  expires_in: number;
};

export class OneDriveAuth {
  private _token: string;
  private expires: number;
  private readonly tenant: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  public constructor() {
    this.tenant = Config.get(OD_TENANT);
    this.clientId = Config.get(OD_CLIENT_ID);
    this.clientSecret = Config.get(OD_CLIENT_SECRET);

    this.expires = 0;
  }

  public async getToken(): Promise<string> {
    if (Date.now() > this.expires) {
      const { body }: { body: Login } = await needle('post', `https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0/token`, {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'https://graph.microsoft.com/.default',
      });
      this._token = body.access_token;
      this.expires = Date.now() + body.expires_in * 1000;
    }

    return this._token;
  }
}
