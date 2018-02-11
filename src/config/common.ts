import {ConnectionConfig} from "mysql";

export interface Config {
  hapi: {
    host: string;
    port: number;
  };
  mysql: ConnectionConfig;
}

export const common: Config = {
  hapi: {
    host: "0.0.0.0",
    port: 3000,
  },
  mysql: {
    database: "node_rss_aggregator",
    host: "127.0.0.1",
    password: process.env.MYSQL_PASSWORD,
    port: 3306,
    user: "rss",
  },
};
