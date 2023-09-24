import {
  ConfigDAO,
  GitlabDAO,
  GitlabDAOImpl,
  LocalFileDAO,
  LocalFileDAOImpl,
  MemberDAO,
  MemberDAOImpl,
  OneDriveDAO,
  OneDriveDAOImpl,
  SQLQueryDAO,
  SQLQueryDAOImpl,
} from '.';

import { ConfigDAOImpl } from './dao/dao_impl/config-dao_impl';

export class DataAccessFactory {
  public static getMemberDAO(): MemberDAO {
    return new MemberDAOImpl();
  }

  public static getLocalFileDAO(): LocalFileDAO {
    return new LocalFileDAOImpl();
  }

  public static getSqlQueryDAO(): SQLQueryDAO {
    return new SQLQueryDAOImpl();
  }

  public static getOneDriveDAO(): OneDriveDAO {
    return new OneDriveDAOImpl();
  }

  public static getGitlabDAO(): GitlabDAO {
    return new GitlabDAOImpl();
  }

  public static getConfigDAO(): ConfigDAO {
    return new ConfigDAOImpl();
  }
}
