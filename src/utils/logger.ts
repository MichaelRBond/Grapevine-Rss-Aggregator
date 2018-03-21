import * as winston from "winston";
import { config } from "../config";

export const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(config.logger),
  ],
});
