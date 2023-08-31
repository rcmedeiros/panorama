import { isProduction, waitFor, waitUntil } from '../../helpers';

import { OneDrive } from './one_drive_delta';
import { OneDriveAuth } from './one_drive_auth';
import { PostgreSQLAdapter } from '../../adapters';

export class LocalFiles {
  private readonly auth: OneDriveAuth;
  private readonly db: PostgreSQLAdapter;
  private readonly oneDrive: OneDrive;

  public constructor() {
    this.auth = new OneDriveAuth(process.env.OD_TENANT, process.env.OD_CLIENT_ID, process.env.OD_CLIENT_SECRET);
    this.db = PostgreSQLAdapter.getInstance(process.env.DB);
    this.oneDrive = new OneDrive();
  }

  public start(): void {
    void (async (): Promise<void> => {
      await waitUntil(() => this.db.ready);

      const users: Array<{ username: string; drive_id: string }> = (await this.db.executeQuery({
        name: 'getMonitoredUsers',
        text: `
          select
            m.username
            ,m.drive_id
          from
            main.members m
          where
            m.monitored = true
        `,
        values: undefined,
      })) as Array<{ username: string; drive_id: string }>;

      /**   TODO: From user e-mail, get id. From user id, get drive.
      const { body }: { body: unknown } = await needle('get', `https://graph.microsoft.com/v1.0/users/rafael.medeiros@carenet.com.br`, undefined, {
        headers: { Authorization: `Bearer ${await this.auth.getToken()}` },
      });

      const { body }: { body: unknown } = await needle('get', `https://graph.microsoft.com/v1.0/users/${users[0].azure_object_id}/drive`, undefined, {
        headers: { Authorization: `Bearer ${await this.auth.getToken()}` },
      });
      */

      console.debug('Starting OneDrive monitoring...');

      const deltaLink: Record<string, string> = {};
      users.forEach((user: { username: string }) => {
        deltaLink[user.username] = 'latest';
      });

      do {
        for (const user of users) {
          deltaLink[user.username] = await this.oneDrive.delta(user.drive_id, await this.auth.getToken(), deltaLink[user.username], (fileName: string) => {
            console.debug(`${user.username} -> ${fileName}`);
            void (async (): Promise<void> => {
              await this.db.executeQuery({
                name: 'insertLocalFiles',
                text: 'INSERT INTO main.local_files ("member", filename) VALUES($1, $2);',
                values: [user.username, fileName],
              });
            })();
          });
        }

        await waitFor(isProduction() ? 60000 : 5000);
      } while (deltaLink);
    })();
  }
}
//
