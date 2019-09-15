import * as FP from "feedparser";
import * as fs from "fs";
import { FeedParser, rssItemBaseFromFeedParser } from "../../../src/utils/feed-parser";
import { getGuid } from "../../../src/utils/rss";

describe("Unit: feed-parser", () => {

  let date: Date;
  let fpItem: FP.Item;
  let fp: FeedParser;

  beforeEach(() => {

    fp = new FeedParser();

    date = new Date("1995-12-17T03:24:00");
    fpItem = {
      author: "fp author",
      categories: ["fp category"],
      comments: "fp comments",
      description: "fp description",
      enclosures: [],
      image: {},
      link: "fp link",
      pubdate: new Date("1995-12-17T03:24:00"),
      summary: "fp summary",
      title: "fp title",
    } as FP.Item;
  });

  it("returns an array of RssItemBases", async () => {
    const rssStringPromise = new Promise((resolve, reject) => {
      fs.readFile("./tests/test-data/rss.slashdot.xml", "utf8", (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
    const parsedFeed = await fp.parse(await rssStringPromise as string);
    expect(parsedFeed.length).toEqual(15);
  });

  it("returns an RssItemBase: blank origlink, blank date", () => {

    const result = rssItemBaseFromFeedParser(fpItem);
    expect(result).toHaveProperty("author", fpItem.author);
    expect(result).toHaveProperty("categories", fpItem.categories);
    expect(result).toHaveProperty("comments", fpItem.comments);
    expect(result).toHaveProperty("description", fpItem.description);
    expect(result).toHaveProperty("enclosures", []);
    expect(result).toHaveProperty("guid", getGuid(fpItem));
    expect(result).toHaveProperty("image", {});
    expect(result).toHaveProperty("link", fpItem.link);
    expect(result).toHaveProperty("published", date);
    expect(result).toHaveProperty("summary", fpItem.summary);
    expect(result).toHaveProperty("title", fpItem.title);
    expect(result).toHaveProperty("updated", date);
  });

  it("returns an RssItemBase: blank link, blank pubdate", () => {
    date = new Date("1996-12-17T03:24:00");
    fpItem.pubdate = undefined;
    fpItem.date = date;
    fpItem.link = undefined;
    fpItem.origlink = "fp Origlink";

    const result = rssItemBaseFromFeedParser(fpItem);
    expect(result).toHaveProperty("author", fpItem.author);
    expect(result).toHaveProperty("categories", fpItem.categories);
    expect(result).toHaveProperty("comments", fpItem.comments);
    expect(result).toHaveProperty("description", fpItem.description);
    expect(result).toHaveProperty("enclosures", []);
    expect(result).toHaveProperty("guid", getGuid(fpItem));
    expect(result).toHaveProperty("image", {});
    expect(result).toHaveProperty("link", fpItem.origlink);
    expect(result).toHaveProperty("published", date);
    expect(result).toHaveProperty("summary", fpItem.summary);
    expect(result).toHaveProperty("title", fpItem.title);
    expect(result).toHaveProperty("updated", date);
  });
});
