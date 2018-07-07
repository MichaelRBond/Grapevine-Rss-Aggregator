import { Section } from "command-line-usage";
import commandLineUsage = require("command-line-usage");

export function displayCliUsage(sections: Section[]): void {
  console.log(commandLineUsage(sections)); // tslint:disable-line
}
