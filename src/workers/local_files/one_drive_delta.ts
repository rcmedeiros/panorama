import needle, { NeedleResponse } from 'needle';

import { waitFor } from '../../helpers';

type DriveItem = {
  id: string;
  name: string;
  webUrl: string;
};

type ChildrenResponse = {
  value: Array<DriveItem>;
};

type Resource = {
  resource: string;
};

type DeltaResponse = {
  '@odata.context': string;
  '@odata.deltaLink': string;
  '@odata.nextLink': string;
  value: Array<DriveItem>;
};

export type NotifyLocalFile = (fileName: string) => void;

export class OneDrive {
  private async identify(id: string, driveId: string, token: string): Promise<string> {
    let fileName: string = 'New file';

    const { body }: { body: ChildrenResponse } = await needle('get', `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${id}/children`, undefined, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const entriesFile: DriveItem = (body.value?.filter((f: DriveItem) => f.name === 'entries.json') || [undefined])[0];

    if (entriesFile) {
      const content: NeedleResponse = await needle('get', `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${entriesFile.id}/content`, undefined, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (content.headers?.location) {
        const resp2: NeedleResponse = await needle('get', content.headers.location, undefined, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fileName = (resp2.body as Resource)?.resource;
      }
    }

    return fileName;
  }

  private async readValues(body: DeltaResponse, driveId: string, token: string, notify: NotifyLocalFile): Promise<void> {
    if (body.value?.length) {
      for (const f of body.value) {
        if (f.webUrl?.includes('vscode_history')) {
          const s: string = f.webUrl.substring(f.webUrl.indexOf('carenet_com_br/') + 15);
          if ((s.match(/\//g) || []).length === 2) {
            void notify(await this.identify(f.id, driveId, token));
          }
        }
        await waitFor(1000);
      }
    }
  }

  public async delta(driveId: string, token: string, delta: string, notify: NotifyLocalFile): Promise<string> {
    let { body }: { body: DeltaResponse } = await needle(
      'get',
      `https://graph.microsoft.com/v1.0/drives/${driveId}/root/delta${delta ? `?token=${delta}` : ''}`,
      undefined,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (body['@odata.nextLink']) {
      do {
        ({ body } = await needle('get', body['@odata.nextLink'], undefined, { headers: { Authorization: `Bearer ${token}` } }));
        void this.readValues(body, driveId, token, notify);
      } while (body['@odata.nextLink']);
    }

    if (body['@odata.deltaLink']) {
      void this.readValues(body, driveId, token, notify);
      return body['@odata.deltaLink'].substring(body['@odata.deltaLink'].indexOf('?token=') + 7);
    }

    console.error(JSON.stringify(body));
    return undefined;
  }
}
