import { MySqlClient } from "../../src/clients/mysql-client";

export async function resetTables(mysqlClientProvider: () => MySqlClient): Promise<void> {
  const mysql = mysqlClientProvider();
  const tables = await mysql.query("SELECT `table_name` FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA="
    + "'node_rss_aggregator' AND TABLE_TYPE='BASE TABLE'");
  for (const table of tables) {
    await mysql.query(`TRUNCATE TABLE ${table.table_name}`);
  }
  return;
}
