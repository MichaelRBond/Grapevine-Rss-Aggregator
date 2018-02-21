
import * as crypto from "crypto";
import * as FP from "feedparser";
import { isNullOrUndefined } from "util";

export function getGuid(item: FP.Item): string {
  const guid = isNullOrUndefined(item.guid) ? item.link : item.guid;
  return crypto.createHash("sha256").update(guid).digest("hex");
}
