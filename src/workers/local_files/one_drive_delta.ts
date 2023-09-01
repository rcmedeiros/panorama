import { Delta, OneDriveChildren, OneDriveDAO, OneDriveItem } from '../../model';

import { waitFor } from '../../helpers';

type Resource = {
  resource: string;
};

export type NotifyLocalFile = (fileName: string) => void;

export class OneDrive {
  private readonly oneDriveDAO: OneDriveDAO;
  private readonly cache: Map<string, string>;

  public constructor(oneDriveDAO: OneDriveDAO) {
    this.oneDriveDAO = oneDriveDAO;
    this.cache = new Map();
    this.scheduleCacheClean();
  }

  private async identify(fileId: string, driveId: string): Promise<string> {
    let fileName: string = undefined;

    if (this.cache.has(fileId)) return this.cache.get(fileId);

    const children: OneDriveChildren = await this.oneDriveDAO.getChildren(driveId, fileId);
    const entriesFile: OneDriveItem = (children.value?.filter((f: OneDriveItem) => f.name === 'entries.json') || [undefined])[0];
    if (entriesFile) {
      const content: Resource = (await this.oneDriveDAO.getFileContent(driveId, entriesFile.id)) as Resource;
      fileName = content?.resource;
      this.cache.set(fileId, fileName);
    }

    return fileName;
  }

  private async readValues(files: Array<OneDriveItem>, driveId: string, notify: NotifyLocalFile): Promise<void> {
    if (files?.length) {
      for (const f of files) {
        if (f.webUrl?.includes('vscode_history')) {
          const s: string = f.webUrl.substring(f.webUrl.indexOf('carenet_com_br/') + 15);
          if ((s.match(/\//g) || []).length === 2) {
            const fileName: string = await this.identify(f.id, driveId);
            if (fileName) void notify(fileName);
          }
        }
        await waitFor(1000);
      }
    }
  }

  private scheduleCacheClean(): void {
    const d: Date = new Date();
    d.setDate(d.getDate() + 1);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);

    setTimeout(() => {
      this.cache.clear();
      this.scheduleCacheClean();
    }, d.getTime() - Date.now());
  }

  public async delta(driveId: string, delta: string, notify: NotifyLocalFile): Promise<string> {
    const d: Delta = await this.oneDriveDAO.getDelta(driveId, delta);
    void this.readValues(d.values, driveId, notify);

    return d.deltaLink;
  }
}
