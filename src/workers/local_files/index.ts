import { DataAccessFactory, LocalFile, LocalFileDAO, Member, MemberDAO, OneDriveDAO } from '../../model';
import { isProduction, waitFor } from '../../helpers';

import { OneDrive } from './one_drive_delta';

export class LocalFiles {
  private readonly memberDAO: MemberDAO;
  private readonly localFileDAO: LocalFileDAO;
  private readonly oneDriveDAO: OneDriveDAO;
  private readonly oneDrive: OneDrive;
  private readonly deltaLink: Record<string, string>;
  private readonly memberCounter: Set<string>;
  private filesCounter: number = 0;

  public constructor() {
    this.memberDAO = DataAccessFactory.getMemberDAO();
    this.localFileDAO = DataAccessFactory.getLocalFileDAO();
    this.oneDriveDAO = DataAccessFactory.getOneDriveDAO();
    this.oneDrive = new OneDrive(this.oneDriveDAO);

    this.deltaLink = {};
    this.memberCounter = new Set();
    this.filesCounter = 0;
  }

  private async setupDrive(member: Member): Promise<void> {
    member.driveId = await this.oneDriveDAO.getUserDrive(await this.oneDriveDAO.getUserId(member.office365Username));
    await this.memberDAO.setupDrive(member);
  }

  private addToCounter(username: string): void {
    this.memberCounter.add(username);
    this.filesCounter++;
  }

  private resetCounter(): void {
    if (this.filesCounter) {
      console.info(
        `Logged ${this.filesCounter} modification${this.filesCounter > 1 ? 's' : ''} by ${this.memberCounter.size} member${
          this.memberCounter.size > 1 ? 's' : ''
        }`,
      );
      this.memberCounter.clear();
      this.filesCounter = 0;
    }
  }

  public start(): void {
    void (async (): Promise<void> => {
      await this.memberDAO.isReady();

      const members: Array<Member> = await this.memberDAO.getMembers(true);

      for (const user of members) {
        if (!user.driveId) {
          await this.setupDrive(user);
        }
      }

      console.debug('Starting OneDrive monitoring...');

      members.forEach((member: Member) => {
        this.deltaLink[member.username] = member.deltaLink || 'latest';
      });

      do {
        try {
          for (const member of members) {
            this.deltaLink[member.username] = await this.oneDrive.delta(member.driveId, this.deltaLink[member.username], (update: LocalFile) => {
              this.addToCounter(member.username);
              console.debug(`${member.username} -> ${update.fileName}`);

              void (async (): Promise<void> => {
                await Promise.all([
                  this.localFileDAO.insertFile({ ...update, ...{ member: member.username } }),
                  this.memberDAO.updateDeltaLink(member.username, this.deltaLink[member.username]),
                ]);
              })();
            });
          }
        } catch (e) {
          console.error(e);
        }
        await waitFor(isProduction() ? 60000 : 5000);

        this.resetCounter();
      } while (this.deltaLink);
    })();
  }
}
