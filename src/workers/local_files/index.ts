import { DataAccessFactory, LocalFileDAO, Member, MemberDAO, OneDriveDAO } from '../../model';
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

      const users: Array<Member> = await this.memberDAO.getMembers(true);

      for (const user of users) {
        if (!user.driveId) {
          await this.setupDrive(user);
        }
      }

      console.debug('Starting OneDrive monitoring...');

      users.forEach((user: { username: string }) => {
        this.deltaLink[user.username] = 'latest';
      });

      do {
        for (const user of users) {
          this.deltaLink[user.username] = await this.oneDrive.delta(user.driveId, this.deltaLink[user.username], (fileName: string) => {
            this.addToCounter(user.username);
            console.debug(`${user.username} -> ${fileName}`);

            void (async (): Promise<void> => {
              await this.localFileDAO.insertFile({ member: user.username, fileName: fileName });
            })();
          });
        }

        await waitFor(isProduction() ? 60000 : 5000);

        this.resetCounter();
      } while (this.deltaLink);
    })();
  }
}
