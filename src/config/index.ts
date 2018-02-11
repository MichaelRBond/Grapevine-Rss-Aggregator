import { Config } from "./common";

const env = process.env.CONFIG_ENV || "local";
export const config: Config = require(`./${env}`).config; // tslint:disable-line
