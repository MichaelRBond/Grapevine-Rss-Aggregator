import * as crypto from "crypto";
import * as FP from "feedparser";
import { getGuid } from "../../../src/utils/rss";

describe("Unit: rss", () => {
  it("getGuid when item has guid", () => {
    const item = {
      guid: "1234-guid-1234",
      link: "http://test.com",
    } as FP.Item;
    const result = getGuid(item);
    expect(result).toEqual(crypto.createHash("sha256").update(item.guid).digest("hex"));
  });

  it("getGuid when item has no guid", () => {
    const link = "http://test.com";
    const item = {
      link,
    } as FP.Item;
    const result = getGuid(item);
    expect(result).toEqual(crypto.createHash("sha256").update(link).digest("hex"));
  });
});
