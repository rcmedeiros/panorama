import {
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
}
