import { Delta, LocalFile, OneDriveChildren, OneDriveDAO, OneDriveItem } from '../../model';

import { waitFor } from '../../helpers';

type ResourceEntry = { id: string; timestamp: number; date: Date };

type Resource = {
  resource: string;
  entries: Array<ResourceEntry>;
};

export type NotifyLocalFile = (fileName: LocalFile) => void;

export class OneDrive {
  private readonly oneDriveDAO: OneDriveDAO;

  public constructor(oneDriveDAO: OneDriveDAO) {
    this.oneDriveDAO = oneDriveDAO;
  }

  private async identify(fileId: string, driveId: string): Promise<LocalFile> {
    const result: LocalFile = {
      member: undefined,
      fileName: undefined,
      timestamp: undefined,
    };

    const children: OneDriveChildren = await this.oneDriveDAO.getChildren(driveId, fileId);
    const entriesFile: OneDriveItem = (children.value?.filter((f: OneDriveItem) => f.name === 'entries.json') || [undefined])[0];
    if (entriesFile) {
      const content: Resource = (await this.oneDriveDAO.getFileContent(driveId, entriesFile.id)) as Resource;
      result.timestamp = new Date(Math.max(...content.entries.map((e: ResourceEntry) => e.timestamp)));
      result.fileName = content?.resource;
    }

    return result;
  }

  private async readValues(files: Array<OneDriveItem>, driveId: string, notify: NotifyLocalFile): Promise<void> {
    if (files?.length) {
      for (const f of files) {
        if (f.webUrl?.includes('vscode_history')) {
          const s: string = f.webUrl.substring(f.webUrl.indexOf('carenet_com_br/') + 15);
          if ((s.match(/\//g) || []).length === 2) {
            const update: LocalFile = await this.identify(f.id, driveId);
            if (update.fileName) void notify(update);
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
