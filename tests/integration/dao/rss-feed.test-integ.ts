import { mysqlClientEnd, mysqlClientProvider } from "../../../src/clients/mysql-client";
import { RssFeedDao } from "../../../src/dao/rss-feed";
import { RssFeed, RssFeedBase } from "../../../src/models/rss";
import { DateTime } from "../../../src/utils/date-time";
import { Mock, mock, verify } from "../../utils/mockfill";
import { resetTables } from "../../utils/mysql";

describe("Integration: rss-feed", () => {

  let datetime: Mock<DateTime>;
  let dao: RssFeedDao;

  let feed: RssFeedBase;

  const date = 123456789;

  beforeEach(async () => {
    datetime = mock<DateTime>();
    dao = new RssFeedDao(mysqlClientProvider, datetime);

    await resetTables(mysqlClientProvider);

    feed = {
      title: "test feed",
      url: "http://url.com",
    };

    datetime.dateNoWInSeconds = () => date;
  });

  afterAll(async () => {
    await mysqlClientEnd();
  });

  it("saves a feed to the database", async () => {
    const result = await dao.save(feed);

    expect(result).toHaveProperty("title", feed.title);
    expect(result).toHaveProperty("url", feed.url);
    expect(result).toHaveProperty("addedOn", date);
    expect(result).toHaveProperty("lastUpdated", 0);

    verify(datetime.dateNoWInSeconds).calledOnce();
  });

  it("gets a list of all the feeds", async () => {
    expect((await dao.getFeeds()).length).toEqual(0);

    for (let i = 0; i < 20; i++) {
      const f: RssFeedBase = {
        title: `test ${i}`,
        url: `http://${0}`,
      };
      await dao.save(f);
    }

    const result = await dao.getFeeds();
    expect(result.length).toEqual(20);
    verify(datetime.dateNoWInSeconds).called(20);
  });

  it("gets a feed by feed id", async () => {
    const saveResult = await dao.save(feed);
    const getResult = await dao.getById(saveResult.id);
    expect(getResult).toHaveProperty("title", feed.title);
    expect(getResult).toHaveProperty("url", feed.url);
    expect(getResult).toHaveProperty("addedOn", date);
    expect(getResult).toHaveProperty("lastUpdated", 0);
  });

  it("updates a feed", async () => {
    const result = await dao.save(feed);

    expect(result).toHaveProperty("title", feed.title);
    expect(result).toHaveProperty("url", feed.url);
    expect(result).toHaveProperty("addedOn", date);
    expect(result).toHaveProperty("lastUpdated", 0);

    result.title = "updated title";

    const updated = await dao.update(result);
    expect(updated).toHaveProperty("title", "updated title");
    expect(updated).toHaveProperty("url", feed.url);
    expect(updated).toHaveProperty("addedOn", date);
    expect(updated).toHaveProperty("lastUpdated", date);

    verify(datetime.dateNoWInSeconds).called(2);
  });

  it("returns null when updating an id that doesn't exist", async () => {
    const feedUpdate = {
      id: 100,
      title: "test feed",
      url: "http://url.com",
    } as RssFeed;
    const result = await dao.update(feedUpdate);
    expect(result).toBeNull();
  });
});
