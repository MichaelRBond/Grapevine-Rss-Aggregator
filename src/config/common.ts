import {ConnectionConfig} from "mysql";

interface LoggerConfig {
  colorize: boolean;
  json: boolean;
  level: string;
}

export interface Config {
  hapi: {
    host: string;
    port: number;
  };
  logger: LoggerConfig;
  mysql: ConnectionConfig;
  schedule: string;
}

export const common: Config = {
  hapi: {
    host: "0.0.0.0",
    port: 3000,
  },
  logger: {
    colorize: true,
    json: false,
    level: "debug",
  },
  mysql: {
    database: "node_rss_aggregator",
    host: "127.0.0.1",
    password: process.env.MYSQL_PASSWORD,
    port: 3306,
    user: "rss",
  },
  schedule: "*/15 * * * *", // every 15 minutes
};
