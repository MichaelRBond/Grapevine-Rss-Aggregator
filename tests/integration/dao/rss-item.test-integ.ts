import { mysqlClientEnd, mysqlClientProvider } from "../../../src/clients/mysql-client";
import { RssItemDao } from "../../../src/dao/rss-item";
import { RssFeed, RssItemBase } from "../../../src/models/rss";
import { resetTables } from "../../utils/mysql";

describe("Integration: feed-item", () => {

  let dao: RssItemDao;

  const published = new Date("December 24, 2000 06:00:00");
  const updated = new Date("December 25, 2000 06:00:00");

  beforeEach(async () => {
    dao = new RssItemDao(mysqlClientProvider);

    await resetTables(mysqlClientProvider);
  });

  afterAll(async () => {
    await mysqlClientEnd();
  });

  it("saves an item to the database with update and pub dates", async () => {
    const item: RssItemBase = {
      author: "Test author",
      categories: [],
      comments: "test comments",
      description: "test description",
      enclosures: [],
      guid: "85879eac064de3cf9a5357985286171f78e411b5b5002f19f7b891ef9f5ca854",
      image: {},
      link: "http://foo.com/something",
      published,
      summary: "test summary",
      title: "test title",
      updated,
    };

    const result = await dao.save(item, {id: 1} as RssFeed);
    expect(result.updated).toEqual(updated);
    expect(result.published).toEqual(published);
  });

  it("saves an item to the database with just pub date", async () => {
    const item: RssItemBase = {
      author: "Test author",
      categories: [],
      comments: "test comments",
      description: "test description",
      enclosures: [],
      guid: "85879eac064de3cf9a5357985286171f78e411b5b5002f19f7b891ef9f5ca854",
      image: {},
      link: "http://foo.com/something",
      published,
      summary: "test summary",
      title: "test title",
      updated: undefined,
    };

    const result = await dao.save(item, {id: 1} as RssFeed);
    expect(result.updated).toBeNull();
    expect(result.published).toEqual(published);
  });

  it("saves an item to the database with just updated date", async () => {
    const item: RssItemBase = {
      author: "Test author",
      categories: [],
      comments: "test comments",
      description: "test description",
      enclosures: [],
      guid: "85879eac064de3cf9a5357985286171f78e411b5b5002f19f7b891ef9f5ca854",
      image: {},
      link: "http://foo.com/something",
      published: undefined,
      summary: "test summary",
      title: "test title",
      updated,
    };

    const result = await dao.save(item, {id: 1} as RssFeed);
    expect(result.updated).toEqual(updated);
    expect(result.published).toBeNull();
  });

  it("returns null when no id can be found", async () => {
    const result = await dao.getById(1000);
    expect(result).toBeNull();
  });

  it("returns null when no guid can be found", async () => {
    const result = await dao.getByGuid("abcd");
    expect(result).toBeNull();
  });

  it("Updates a feed item already saved to the database", async () => {
    const item: RssItemBase = {
      author: "Test author",
      categories: [],
      comments: "test comments",
      description: "test description",
      enclosures: [],
      guid: "85879eac064de3cf9a5357985286171f78e411b5b5002f19f7b891ef9f5ca854",
      image: {},
      link: "http://foo.com/something",
      published: undefined,
      summary: "test summary",
      title: "test title",
      updated,
    };
    const result = await dao.save(item, {id: 1} as RssFeed);
    expect(result.title).toEqual("test title");

    item.title = "foo";

    const updatedResult = await dao.update(item);
    expect(updatedResult.title).toEqual("foo");
  });

  it("Throws an error when trying to update an item that doesn't exist", async () => {
    const item: RssItemBase = {
      author: "Test author",
      categories: [],
      comments: "test comments",
      description: "test description",
      enclosures: [],
      guid: "85879eac064de3cf9a5357985286171f78e411b5b5002f19f7b891ef9f5ca854",
      image: {},
      link: "http://foo.com/something",
      published: undefined,
      summary: "test summary",
      title: "test title",
      updated,
    };
    try {
      await dao.update(item);
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err.message).toContain("Error updating");
    }
  });

});
