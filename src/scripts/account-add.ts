import { OptionDefinition } from "command-line-args";
import commandLineArgs = require("command-line-args");
import { Section } from "command-line-usage";
import { config } from "../config";
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

// Check to see if the user exists
// -- if yes, exit

// gen salt
// gen api key
// gen hash
// save account to the database
// display the api key
