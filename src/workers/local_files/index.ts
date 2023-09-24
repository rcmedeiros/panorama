import { DataAccessFactory, GitlabDAO, LocalFile, LocalFileDAO, Member, MemberDAO, OneDriveDAO } from '../../model';
import { isProduction, waitFor, waitUntil } from '../../helpers';

import { OneDrive } from './one_drive_delta';

export class LocalFiles {
  private readonly memberDAO: MemberDAO;
  private readonly localFileDAO: LocalFileDAO;
  private readonly oneDriveDAO: OneDriveDAO;
  private readonly gitlabDAO: GitlabDAO;
  private readonly oneDrive: OneDrive;
  private readonly deltaLink: Record<string, string>;
  private readonly memberCounter: Set<string>;
  private filesCounter: number = 0;
  private projects: Set<string>;

  public constructor() {
    this.memberDAO = DataAccessFactory.getMemberDAO();
    this.localFileDAO = DataAccessFactory.getLocalFileDAO();
    this.oneDriveDAO = DataAccessFactory.getOneDriveDAO();
    this.gitlabDAO = DataAccessFactory.getGitlabDAO();
    this.oneDrive = new OneDrive(this.oneDriveDAO);

    this.deltaLink = {};
    this.memberCounter = new Set();
    this.filesCounter = 0;

    void this.refreshProjects();
  }

  private async refreshProjects(): Promise<void> {
    this.projects = new Set(await this.gitlabDAO.getProjectNames());
    this.projects.add('panorama');
    setTimeout(() => {
      void (async (): Promise<void> => {
        await this.refreshProjects();
      })();
    }, 3600000);
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

  private withProject(localFile: LocalFile): LocalFile {
    const path: Array<string> = localFile.fileName.split('/').reverse();

    for (const component of path) {
      if (this.projects.has(component)) {
        localFile.project = component;
        break;
      }
    }

    return localFile;
  }

  public start(): void {
    return;
    void (async (): Promise<void> => {
      await this.memberDAO.isReady();
      await waitUntil(() => this.projects !== undefined);

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
                  this.localFileDAO.insertFile({ ...this.withProject(update), ...{ member: member.username } }),
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
