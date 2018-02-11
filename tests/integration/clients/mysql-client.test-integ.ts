import { MySqlClient, mysqlClientEnd, mysqlClientProvider } from "../../../src/clients/mysql-client";

describe("Integration: mysql-client", () => {

  let mysql: MySqlClient;

  beforeAll(async () => {
    mysql = await mysqlClientProvider();
  });

  afterAll(async () => {
    await mysqlClientEnd();
  });

  it("can execute a mysql query", async () => {
    const result = await mysql.query("show tables;");
    expect(result.length).toBeGreaterThan(0);
  });

});
