import { common, Config } from "./common";

export const config: Config = {
  ...common,
  mysql: {
    ...common.mysql,
    password: "test",
    port: 3307,
  },
};
