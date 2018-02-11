import { MySqlClient } from "../clients/mysql-client";

export class RssDao {
  constructor(mysqlProvider: () => MySqlClient) { /* */ }

  // TODO : Type return better
  public async save(): Promise<any> {
    return null;
  }
}
