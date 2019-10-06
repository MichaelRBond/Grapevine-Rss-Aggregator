import * as DbMigrate from "db-migrate";
import {config} from "../config";

async function dbMigrate() {

  const dbm = DbMigrate.getInstance(false, {
    config: {
      db: {
        ...config.mysql,
        driver: "mysql",
        multipleStatements: true,
      },
      "sql-file": true,
    },
    env: "db",
  });

  dbm.run();
}

dbMigrate().then(() => console.log("done.")); // tslint:disable-line
