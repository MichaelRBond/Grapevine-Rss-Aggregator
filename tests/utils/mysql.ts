import { MySqlClient } from "../../src/clients/mysql-client";

export async function resetTables(mysqlClientProvider: () => MySqlClient): Promise<void> {
  const mysql = mysqlClientProvider();
  mysql.query("select CONCAT('truncate table ',table_name,';') from INFORMATION_SCHEMA.TABLES "
    + "where TABLE_SCHEMA='node_rss_aggregator' AND TABLE_TYPE='BASE TABLE';");
  return;
}
