import needle from 'needle';

type Login = {
  access_token: string;
  expires_in: number;
};

export class OneDriveAuth {
  private _token: string;
  private expires: number;

  private constructor() {
    this.expires = 0;
  }

  private async getToken(): Promise<string> {
    if (Date.now() > this.expires) {
      const { body }: { body: Login } = await needle('post', `https://login.microsoftonline.com/${process.env.OD_TENANT}/oauth2/v2.0/token`, {
        grant_type: 'client_credentials',
        client_id: process.env.OD_CLIENT_ID,
        client_secret: process.env.OD_CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
      });
      this._token = body.access_token;
      this.expires = Date.now() + body.expires_in * 1000;
    }

    return this._token;
  }
}
