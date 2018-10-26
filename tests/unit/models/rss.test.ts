import { AxiosPromise } from "axios";
import { RssFeedDao } from "../../../src/dao/rss-feed";
import { RssItemDao } from "../../../src/dao/rss-item";
import { ItemFlags, RssFeed, RssFeedBase, RssItem, RssItemBase, RssModel } from "../../../src/models/rss";
import { FeedParser } from "../../../src/utils/feed-parser";
import { Http } from "../../../src/utils/http";
import { getGuid } from "../../../src/utils/rss";
import { Mock, mock, verify } from "../../utils/mockfill";

describe("Unit: RSS Model", () => {

  let feedDao: Mock<RssFeedDao>;
  let itemDao: Mock<RssItemDao>;
  let feedParser: Mock<FeedParser>;
  let http: Mock<Http>;
  let rss: RssModel;

  beforeEach(() => {
    feedDao = mock<RssFeedDao>();
    itemDao = mock<RssItemDao>();
    feedParser = mock<FeedParser>();
    http = mock<Http>();

    rss = new RssModel(feedDao, itemDao, feedParser, http);
  });

  describe("getFeed()", () => {
    it("gets a single feed by id", async () => {
      feedDao.getById = async () => ({
        id: 1,
      } as RssFeed);
      const result = await rss.getFeed(1);
      expect(result).not.toBeNull();
      expect(result).toHaveProperty("id", 1);
      verify(feedDao.getById).calledWithArgsLike(([id]) => {
        expect(id).toEqual(1);
        return true;
      });
    });

    it("returns null when a single feed cannot be found by id", async () => {
      feedDao.getById = async () => null;
      const result = await rss.getFeed(1);
      expect(result).toBeNull();
      verify(feedDao.getById).calledWithArgsLike(([id]) => {
        expect(id).toEqual(1);
        return true;
      });
    });

  });

  describe("getFeeds()", () => {
    it("gets all feeds", async () => {
      feedDao.getFeeds = async () => generateNumOfFeeds(10);
      const result = await rss.getFeeds();
      expect(result.length).toEqual(10);
      verify(feedDao.getFeeds).calledOnce();
    });
  });

  describe("saveFeed()", () => {
    it("saves a feed", async () => {
      feedDao.save = async () => 1;
      feedDao.getById = async () => generateNumOfFeeds(1)[0];
      const feed = await rss.saveFeed({} as RssFeedBase);
      verify(feedDao.save).calledOnce();
      verify(feedDao.getById).calledOnce();
    });

    it("returns null when there is an error saving the feed", async () => {
      feedDao.save = async () => null;
      const feedId = await rss.saveFeed({} as RssFeedBase);
      expect(feedId).toBeNull();
      verify(feedDao.save).calledOnce();
      verify(feedDao.getById).notCalled();
    });
  });

  describe("updateFeed()", () => {
    it("updates a feed", async () => {
      feedDao.update = async () => 1;
      feedDao.getById = async () => generateNumOfFeeds(1)[0];
      const feed = await rss.updateFeed({} as RssFeed);
      verify(feedDao.update).calledOnce();
      verify(feedDao.getById).calledOnce();
    });

    it("it returns null when there is an error updating the feed", async () => {
      feedDao.update = async () => null;
      const feedId = await rss.updateFeed({} as RssFeed);
      expect(feedId).toBeNull();
      verify(feedDao.update).calledOnce();
      verify(feedDao.getById).notCalled();
    });
  });

  describe("fetchFeeds()", () => {
    it("can fetch a feed", async () => {
      feedDao.getFeeds = async () => generateNumOfFeeds(3);
      http.request = async () => ({} as AxiosPromise);
      feedParser.parse = async () => generateNumOfItems(2);

      let count = 0;
      itemDao.getByGuid = async () => {
        return count++ % 2 === 0 ? null : {} as RssItem;
      };

      await rss.fetchFeeds();
      verify(feedDao.getFeeds).calledOnce();
      verify(http.request).called(3);
      verify(feedParser.parse).called(3);
      verify(itemDao.getByGuid).called(6);
      verify(itemDao.save).called(3);
      verify(itemDao.update).called(3);
    });

    it("Continues parsing feeds if some throw errors", async () => {
      feedDao.getFeeds = async () => generateNumOfFeeds(3);
      feedParser.parse = async () => generateNumOfItems(2);

      let httpCount = 0;
      http.request = async () => {
        if (httpCount++ % 2 === 0) {
          throw new Error();
        }
        return {} as AxiosPromise;
      };

      let count = 0;
      itemDao.getByGuid = async () => {
        return count++ % 2 === 0 ? null : {} as RssItem;
      };

      await rss.fetchFeeds();
      verify(feedDao.getFeeds).calledOnce();
      verify(http.request).called(3);
      verify(feedParser.parse).called(1);
      verify(itemDao.getByGuid).called(2);
      verify(itemDao.save).called(1);
      verify(itemDao.update).called(1);
    });
  });

  describe("getFeedItems()", () => {
    it("returns feed items", async () => {
      itemDao.getByFeed = async () => [];
      const result = await rss.getFeedItems(1, false, true);
      expect(result).toHaveLength(0);
      verify(itemDao.getByFeed).calledWith(1, false, true);
    });
  });

  describe("getItems()", () => {
    it("returns items", async () => {
      itemDao.getItems = async () => [];
      const result = await rss.getItems(false, true);
      expect(result).toHaveLength(0);
      verify(itemDao.getItems).calledWith(false, true);
    });
  });

  describe("rssItemToApiResponse()", () => {

    let rssItem: RssItem;

    beforeEach(() => {
      rssItem = {
        author: "John Denver",
        categories: [],
        comments: "http://test.com/comments",
        description: "I've packed my bags",
        enclosures: [],
        feedId: 2,
        guid: "1a",
        id: 1,
        image: {
          title: "some image",
          url: "http://image.com",
        },
        link: "http://test.com",
        published: new Date(),
        read: false,
        starred: false,
        summary: "I'm ready to go",
        title: "Leaving on a Jet Plane",
        updated: new Date(),
      };
    });

    it("converts a RssItem to a RssItemApiResponse", () => {
      const result = rss.rssItemToApiResponse(rssItem);
      expect(result).toEqual({
        author: rssItem.author,
        categories: rssItem.categories,
        comments: rssItem.comments,
        description: rssItem.description,
        enclosures: rssItem.enclosures,
        feed_id: rssItem.feedId,
        guid: rssItem.guid,
        id: rssItem.id,
        image: rssItem.image,
        link: rssItem.link,
        published: rssItem.published,
        read: rssItem.read,
        starred: rssItem.starred,
        summary: rssItem.summary,
        title: rssItem.title,
        updated: rssItem.updated,
      });
    });
  });

  describe("getItemById()", () => {
    it("returns a RssItem", async () => {
      itemDao.getById = async () => ({} as RssItem);
      await rss.getItemById(1);
      verify(itemDao.getById).calledWith(1);
    });
  });

  describe("setItemStatus()", () => {
    it("handles the case of read", async () => {
      await rss.setItemStatus(1, ItemFlags.read);
      verify(itemDao.setItemStatus).calledWith(1, "read", true);
    });

    it("handles the case of unread", async () => {
      await rss.setItemStatus(1, ItemFlags.unread);
      verify(itemDao.setItemStatus).calledWith(1, "read", false);
    });

    it("handles the case of starred", async () => {
      await rss.setItemStatus(1, ItemFlags.starred);
      verify(itemDao.setItemStatus).calledWith(1, "starred", true);
    });

    it("handles the case of unstarred", async () => {
      await rss.setItemStatus(1, ItemFlags.unstarred);
      verify(itemDao.setItemStatus).calledWith(1, "starred", false);
    });

    it("throws an error when an invalid flag is provided", async () => {
      try {
        await rss.setItemStatus(1, "foo" as ItemFlags);
        fail();
      } catch (err) {
        expect(err.message).toEqual("Invalid status flag provided");
      }
      verify(itemDao.setItemStatus).notCalled();
    });
  });
});

function generateNumOfFeeds(numOfFeeds: number): RssFeed[] {
  const feeds: RssFeed[] = [];
  for (let i = 0; i < numOfFeeds; i++) {
    const feed: RssFeed = {
      addedOn: i,
      id: i,
      lastUpdated: null,
      title: `Title ${i}`,
      url: `http://testing-${i}.com`,
    };
    feeds.push(feed);
  }
  return feeds;
}

function generateNumOfItems(numOfItems: number): RssItemBase[] {
  const items: RssItemBase[] = [];
  for (let i = 0; i < numOfItems; i++) {
    items.push({
      author: `author-${i}`,
      categories: [],
      comments: `comments-${i}`,
      description: `description-${i}`,
      enclosures: [`enclosures-${i}`],
      guid: getGuid({link: "foo"} as RssItemBase),
      image: null,
      link: `link-${i}`,
      published: new Date(),
      summary: `summary-${i}`,
      title: `title-${i}`,
      updated: new Date(),
    });
  }
  return items;
}
