import { LocalFile, LocalFileDAO, LocalFileDTO } from '../..';

import { BaseDbDAOImpl } from './base_db-dao_impl';

export class LocalFileDAOImpl extends BaseDbDAOImpl implements LocalFileDAO {
  public async insertFile(file: LocalFile): Promise<void> {
    await this.db.executeQuery({
      name: 'insertLocalFiles',
      text: 'INSERT INTO main.local_file ("member", file_name) VALUES($1, $2);',
      values: [file.member, file.fileName],
    });
  }

  public async getPeriodByMember(begin: Date, end: Date): Promise<{ [member: string]: Array<LocalFile> }> {
    const rows: Array<unknown> = (await this.db.executeQuery({
      name: 'getPeriodByMember',
      text: `
          select
            m."name"
            ,lf.file_name
            ,lf."timestamp"
          from
            main."member" m
            inner join main.local_file lf on lf."member" = m.username
          where lf."timestamp" >= $1 and lf."timestamp" < $2
          order by m.username, lf."timestamp"
        `,
      values: [begin, end],
    })) as Array<unknown>;

    const result: { [member: string]: Array<LocalFile> } = {};

    rows.forEach((r: { name: string }) => {
      result[r.name] = result[r.name] || [];
      result[r.name].push(new LocalFileDTO(r));
    });

    return result;
  }
}
