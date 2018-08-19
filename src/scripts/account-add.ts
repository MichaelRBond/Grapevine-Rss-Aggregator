import commandLineArgs = require("command-line-args");
import { OptionDefinition } from "command-line-args";
import { Section } from "command-line-usage";
import { isNull } from "nullable-ts";
import { mysqlClientProvider } from "../clients/mysql-client";
import { config } from "../config";
import { AccountDao } from "../dao/accounts";
import { AccountModel } from "../models/accounts";
import { genApikey, genHash, genSalt } from "../utils/authentication";
import { displayCliUsage } from "../utils/cli";

const options: OptionDefinition[] = [
  {name: "username", alias: "u", type: String},
];

const usage: Section[] = [
  {
    content: `Add an account to ${config.appName}`,
    header: "account-add",
  },
  {
    header: "Options",
    optionList: [
      {
        alias: "u",
        name: "username",
        type: String,
      },
    ],
  },
];

const args = commandLineArgs(options);

if (!args.username) {
  displayCliUsage(usage);
  process.exit(-1);
}

const accountDao = new AccountDao(mysqlClientProvider);
const accountModel = new AccountModel(accountDao);

let salt: string;
let apikey: string;
accountModel.getByUsername(args.username)
  .then((account) => {
    if (!isNull(account)) {
      console.log("Account already exists"); // tslint:disable-line
      process.exit(-1);
    }
  })
  .then(() => {
    salt = genSalt();
    apikey = genApikey();
    return genHash(salt, apikey, 10);
  })
  .then((hash) => {
    return accountModel.save({
      apikeyHash: hash,
      salt,
      username: args.username,
    });
  })
  .then(() => {
    console.log(`API Key: ${apikey}`); // tslint:disable-line
    process.exit(0);
  })
  .catch((err) => {
    throw err;
  });
