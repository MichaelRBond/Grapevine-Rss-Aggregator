import { createPool, MysqlError, Pool} from "mysql";
import { config } from "../config/index";
import { Nullable } from "../models/nullable";

export class MySqlClient {

  private pool: Nullable<Pool>;

  public async end(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.pool) {
        return;
      }
      this.pool.end((error: Error) => {
        this.pool = null;
        if (error) {
          // TODO: log error
        }
        return resolve();
      });
    });
  }

  public async query(sql: string, values?: any[]): Promise<any> {
    this.createPool();

    if (!values) {
      values = [];
    }

    return new Promise((resolve, reject) => {
      if (!this.pool) {
        // TODO: Log error
        throw new Error("Unable to get MySQL pool");
      }
      this.pool.query(sql, values, (err: MysqlError, results: any[]) => {
        if (err) {
          reject(err);
        }
        resolve(results);
      });
    });
  }

  private createPool(): void {
    if (this.pool) { return; }
    this.pool = createPool(config.mysql);
  }

}

let mysqlClient: MySqlClient;
export async function mysqlClientProvider(): Promise<MySqlClient> {
  if (mysqlClient) {
    return mysqlClient;
  }
  mysqlClient = new MySqlClient();
  return mysqlClient;
}

export async function mysqlClientEnd(): Promise<void> {
  if (!mysqlClient) {
    return;
  }
  return mysqlClient.end();
}
