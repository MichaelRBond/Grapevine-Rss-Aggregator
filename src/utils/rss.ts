
import * as crypto from "crypto";
import * as FP from "feedparser";
import { isNullOrUndefined } from "util";
import { RssItemBase } from "../models/rss";

export function getGuid(item: FP.Item | RssItemBase): string {
  const link = isNullOrUndefined(item.link) ? (item as FP.Item).origlink : item.link;
  const guid = isNullOrUndefined(item.guid) ? link : item.guid;
  return crypto.createHash("sha256").update(guid).digest("hex");
}
