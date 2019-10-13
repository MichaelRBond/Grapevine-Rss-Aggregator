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

  describe("save()", () => {
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

    it("saves an item to the database with no comments", async () => {
      const item: RssItemBase = {
        author: "Test author",
        categories: [],
        comments: undefined,
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
      expect(result.comments).toBeNull();
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
  });

  describe("update()", () => {
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

    it("Updates a feed item already saved to the database with null comments", async () => {
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
      item.comments = undefined;

      const updatedResult = await dao.update(item);
      expect(updatedResult.title).toEqual("foo");
      expect(updatedResult.comments).toBeNull();
    });

    it("Updates a feed item already saved to the database with a new publish", async () => {
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
      expect(result.title).toEqual("test title");

      item.title = "foo";

      const updatedResult = await dao.update(item);
      expect(updatedResult.title).toEqual("foo");
      expect(updatedResult.updated).toBeNull();
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

  describe("getById", () => {
    it("returns null when no id can be found", async () => {
      const result = await dao.getById(1000);
      expect(result).toBeNull();
    });
  });

  describe("getByGuid", () => {
      it("returns null when no guid can be found", async () => {
      const result = await dao.getByGuid("abcd");
      expect(result).toBeNull();
    });
  });

  describe("getByFeed()", () => {

    beforeEach(async () => {
      await populateItems();
    });

    it("returns all items for a feed", async () => {
      const items = await dao.getByFeed(1);
      expect(items).toHaveLength(8);
    });

    it("returns all read items for a feed", async () => {
      const items = await dao.getByFeed(1, false);
      expect(items).toHaveLength(4);
      items.forEach((i) => {
        expect(i.read).toEqual(false);
      });
    });

    it("returns all unread items for a feed", async () => {
      const items = await dao.getByFeed(1, true);
      expect(items).toHaveLength(4);
      items.forEach((i) => {
        expect(i.read).toEqual(true);
      });
    });

    it("returns all starred items for feed", async () => {
      const items = await dao.getByFeed(1, null, true);
      expect(items).toHaveLength(4);
      items.forEach((i) => {
        expect(i.starred).toEqual(true);
      });
    });

    it("returns all items that are not starred for a feed", async () => {
      const items = await dao.getByFeed(1, null, false);
      expect(items).toHaveLength(4);
      items.forEach((i) => {
        expect(i.starred).toEqual(false);
      });
    });

    it("returns all read items that are not starred", async () => {
      const items = await dao.getByFeed(1, true, false);
      expect(items).toHaveLength(2);
      items.forEach((i) => {
        expect(i.read).toEqual(true);
        expect(i.starred).toEqual(false);
      });
    });

    it("returns all unread items that are not starred", async () => {
      const items = await dao.getByFeed(1, false, false);
      expect(items).toHaveLength(2);
      items.forEach((i) => {
        expect(i.read).toEqual(false);
        expect(i.starred).toEqual(false);
      });
    });

    it("returns all read items that are starred", async () => {
      const items = await dao.getByFeed(1, true, true);
      expect(items).toHaveLength(2);
      items.forEach((i) => {
        expect(i.read).toEqual(true);
        expect(i.starred).toEqual(true);
      });
    });

    it("returns all unread items that are starred", async () => {
      const items = await dao.getByFeed(1, false, true);
      expect(items).toHaveLength(2);
      items.forEach((i) => {
        expect(i.read).toEqual(false);
        expect(i.starred).toEqual(true);
      });
    });
  });

  describe("getItems()", () => {

    beforeEach(async () => {
      await populateItems();
    });

    it("returns all items", async () => {
      const items = await dao.getItems();
      expect(items).toHaveLength(16);
    });

    it("returns all starred items", async () => {
      const items = await dao.getItems(null, true);
      expect(items).toHaveLength(8);
    });

    it("returns all unread items", async () => {
      const items = await dao.getItems(true);
      expect(items).toHaveLength(8);
    });

    it("returns all starred items that are unread", async () => {
      const items = await dao.getItems(false, true);
      expect(items).toHaveLength(4);
    });

    it("returns all starred items that are read", async () => {
      const items = await dao.getItems(true, true);
      expect(items).toHaveLength(4);
    });

    it("returns all unstarred items that are read", async () => {
      const items = await dao.getItems(true, false);
      expect(items).toHaveLength(4);
    });

    it("returns all unstarred items that are unread", async () => {
      const items = await dao.getItems(true, false);
      expect(items).toHaveLength(4);
    });
  });

  describe("setItemStatus()", () => {

    const mysql = mysqlClientProvider();

    beforeEach(async () => {
      await populateItems();
    });

    it("updates the read starred status of an item with true", async () => {
      const check = await mysql.query("select * from items where id=1");
      expect(check[0].read).toEqual(0);

      await dao.setItemStatus([1], "read", true);

      const verify = await mysql.query("select * from items where id=1");
      expect(verify[0].read).toEqual(1);
    });

    it("updates the read status of the item with false", async () => {
      await dao.setItemStatus([1], "read", true);
      const check = await mysql.query("select * from items where id=1");
      expect(check[0].read).toEqual(1);

      await dao.setItemStatus([1], "read", false);

      const verify = await mysql.query("select * from items where id=1");
      expect(verify[0].read).toEqual(0);
    });

    it("updates the starred status of the item with true", async () => {
      const check = await mysql.query("select * from items where id=1");
      expect(check[0].starred).toEqual(0);

      await dao.setItemStatus([1], "starred", true);

      const verify = await mysql.query("select * from items where id=1");
      expect(verify[0].starred).toEqual(1);
    });

    it("updates the starred status of the item with false", async () => {
      await dao.setItemStatus([1], "starred", true);
      const check = await mysql.query("select * from items where id=1");
      expect(check[0].starred).toEqual(1);

      await dao.setItemStatus([1], "starred", false);

      const verify = await mysql.query("select * from items where id=1");
      expect(verify[0].starred).toEqual(0);
    });

    it("updates multiple items", async () => {
      await dao.setItemStatus([1, 2], "starred", true);

      const check = await mysql.query("select * from items where id in (1, 2)");
      expect(check[0].starred).toEqual(1);
      expect(check[1].starred).toEqual(1);

      await dao.setItemStatus([1, 2], "starred", false);

      const verify = await mysql.query("select * from items where id in (1, 2)");
      expect(verify[0].starred).toEqual(0);
      expect(verify[1].starred).toEqual(0);
    });

    it("throws an error there is an erro updating the record", async () => {
      try {
        await dao.setItemStatus([42], "read", true);
        fail();
      } catch (err) {
        expect(err.message).toEqual("Error updating item status. Updated 0 of 1");
      }
    });
  });

  describe("deleteItemsFromFeed", () => {
    const mysql = mysqlClientProvider();

    beforeEach(async () => {
      await populateItems();
    });

    it("deletes all of the rss items from the items table for a given feed", async () => {
      const verifyCheck = await mysql.query("SELECT * FROM `items`");
      expect(verifyCheck).toHaveLength(16);
      await dao.deleteItemsFromFeed(1);

      const check = await mysql.query("SELECT * FROM `items`");
      expect(check).toHaveLength(8);
      for (const item of check) {
        expect(item.feedId).not.toEqual(1);
      }
    });
  });

  describe("deleteExpiredItems", () => {
    const mysql = mysqlClientProvider();

    beforeEach(async () => {
      await populateItems();
    });

    it("deletes the expected number of rss items", async () => {
      const result = await dao.deleteExpiredItems(100);
      // expect(result).toEqual(8);

      const verifyRemaining = await mysql.query("select * from `items` where `published`=101");
      expect(verifyRemaining).toHaveLength(8);

      const verifyDelete = await mysql.query("select * from `items` where `published`!=101 AND `starred`=0");
      expect(verifyDelete).toHaveLength(0);

      const verifyDeleteStarred = await mysql.query("select * from `items` where `published`!=101 AND `starred`=1");
      expect(verifyDeleteStarred).toHaveLength(4);
    });
  });

});

async function populateItems(): Promise<void> {
  const mysql = mysqlClientProvider();
  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(1, 'title1a', 0, 0, 'a', 'a', 100)");
  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(1, 'title2a', 0, 0, 'a', 'a', 101)");
  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(1, 'title4a', 1, 0, 'a', 'a', 100)");
  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(1, 'title3a', 1, 0, 'a', 'a', 101)");
  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(1, 'title5a', 0, 1, 'a', 'a', 100)");
  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(1, 'title6a', 0, 1, 'a', 'a', 101)");
  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(1, 'title7a', 1, 1, 'a', 'a', 100)");
  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(1, 'title8a', 1, 1, 'a', 'a', 101)");

  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(2, 'title1b', 0, 0, 'a', 'a', 100)");
  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(2, 'title2b', 0, 0, 'a', 'a', 101)");
  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(2, 'title3b', 1, 0, 'a', 'a', 100)");
  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(2, 'title4b', 1, 0, 'a', 'a', 101)");
  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(2, 'title5b', 0, 1, 'a', 'a', 100)");
  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(2, 'title6b', 0, 1, 'a', 'a', 101)");
  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(2, 'title7b', 1, 1, 'a', 'a', 100)");
  await mysql.query(
    "INSERT INTO `items` (`feedId`, `title`, `read`, `starred`, `link`, `guid`, `published`) "
    + "VALUES(2, 'title8b', 1, 1, 'a', 'a', 101)");
}
