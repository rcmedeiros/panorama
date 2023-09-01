export interface BaseDAO {
  isReady(): Promise<void>;
}
