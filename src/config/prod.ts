import { isNullOrUndefined } from "nullable-ts";
import { common, Config } from "./common";

export const config: Config = {
  ...common,
  mysql: {
    ...common.mysql,
    database: process.env.DB || common.mysql.database,
    host: process.env.DB_HOST || common.mysql.host,
    password: process.env.DB_PASSWD,
    port: isNullOrUndefined(process.env.DB_PORT) ? common.mysql.port : parseInt(process.env.DB_PORT as string, 10),
    user: process.env.DB_USER || common.mysql.user,
  },
};
