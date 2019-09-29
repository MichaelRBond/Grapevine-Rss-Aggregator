import { common, Config } from "./common";

export const config: Config = {
  ...common,
  logger: {
    ...common.logger,
    silent: true,
  },
  mysql: {
    ...common.mysql,
    password: "test",
    port: 3307,
  },
};
