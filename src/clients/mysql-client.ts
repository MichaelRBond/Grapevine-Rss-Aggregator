import { createPool, MysqlError, Pool} from "mysql";
import { Nullable } from "nullable-ts";
import { config } from "../config/index";

export interface OkPacket {
  fieldCount: number;
  affectedRows: number;
  insertId: number;
  serverStatus: number;
  warningCount: number;
  message: string;
  protocol41: boolean;
  changedRows: number;
}

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
      try {
        this.pool.query(sql, values, (err: MysqlError, results: any[]) => {
          if (err) {
            reject(err);
          }
          resolve(results);
        });
      } catch (err) {
        throw new Error(err);
      }
    });
  }

  public async insertUpdate(sql: string, values?: any[]): Promise<OkPacket> {
    return this.query(sql, values);
  }

  private createPool(): void {
    if (this.pool) { return; }
    this.pool = createPool(config.mysql);
  }

}

let mysqlClient: MySqlClient;
export function mysqlClientProvider(): MySqlClient {
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
