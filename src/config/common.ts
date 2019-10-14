import {ConnectionConfig} from "mysql";

interface LoggerConfig {
  colorize: boolean;
  json: boolean;
  level: string;
  silent: boolean;
}

export interface Config {
  appName: string;
  expireItemsInSeconds: number;
  hapi: {
    host: string;
    port: number;
  };
  logger: LoggerConfig;
  mysql: ConnectionConfig;
  schedules: {
    deleteExpiredItems: string;
    rssFetch: string;
  };
}

export const common: Config = {
  appName: "Grapevine RSS Aggregator",
  expireItemsInSeconds: 1209600, // 2 weeks
  hapi: {
    host: "0.0.0.0",
    port: 3000,
  },
  logger: {
    colorize: true,
    json: false,
    level: "debug",
    silent: false,
  },
  mysql: {
    database: "grapevine_rss",
    host: "127.0.0.1",
    port: 3306,
    user: "grapevine",
  },
  schedules: {
    deleteExpiredItems: "0 1 * * 1", // 1am every Monday
    rssFetch: "*/15 * * * *", // every 15 minutes
  },
};
