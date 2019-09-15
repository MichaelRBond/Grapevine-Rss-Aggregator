import { common, Config } from "./common";

export const config: Config = {
  ...common,
  mysql: {
    ...common.mysql,
    password: "rss",
  },
};
