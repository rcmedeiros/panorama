import { Delta, OneDriveChildren, OneDriveDAO, OneDriveItem } from '../../model';

import { waitFor } from '../../helpers';

type Resource = {
  resource: string;
};

export type NotifyLocalFile = (fileName: string) => void;

export class OneDrive {
  private readonly oneDriveDAO: OneDriveDAO;

  public constructor(oneDriveDAO: OneDriveDAO) {
    this.oneDriveDAO = oneDriveDAO;
  }

  private async identify(id: string, driveId: string): Promise<string> {
    let fileName: string = 'New file';

    const children: OneDriveChildren = await this.oneDriveDAO.getChildren(driveId, id);

    const entriesFile: OneDriveItem = (children.value?.filter((f: OneDriveItem) => f.name === 'entries.json') || [undefined])[0];

    if (entriesFile) {
      const content: Resource = (await this.oneDriveDAO.getFileContent(driveId, entriesFile.id)) as Resource;
      fileName = content?.resource;
    }

    return fileName;
  }

  private async readValues(files: Array<OneDriveItem>, driveId: string, notify: NotifyLocalFile): Promise<void> {
    if (files?.length) {
      for (const f of files) {
        if (f.webUrl?.includes('vscode_history')) {
          const s: string = f.webUrl.substring(f.webUrl.indexOf('carenet_com_br/') + 15);
          if ((s.match(/\//g) || []).length === 2) {
            void notify(await this.identify(f.id, driveId));
          }
        }
        await waitFor(1000);
      }
    }
  }

  public async delta(driveId: string, delta: string, notify: NotifyLocalFile): Promise<string> {
    const d: Delta = await this.oneDriveDAO.getDelta(driveId, delta);
    void this.readValues(d.values, driveId, notify);

    return d.deltaLink;
  }
}
