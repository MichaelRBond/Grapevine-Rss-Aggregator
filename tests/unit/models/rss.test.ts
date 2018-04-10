import { AxiosPromise } from "axios";
import { RssFeedDao } from "../../../src/dao/rss-feed";
import { RssItemDao } from "../../../src/dao/rss-item";
import { Rss, RssFeed, RssFeedBase, RssItem, RssItemBase } from "../../../src/models/rss";
import { FeedParser } from "../../../src/utils/feed-parser";
import { Http } from "../../../src/utils/http";
import { getGuid } from "../../../src/utils/rss";
import { Mock, mock, verify } from "../../utils/mockfill";

describe("Unit: RSS Model", () => {

  let feedDao: Mock<RssFeedDao>;
  let itemDao: Mock<RssItemDao>;
  let feedParser: Mock<FeedParser>;
  let http: Mock<Http>;
  let rss: Rss;

  beforeEach(() => {
    feedDao = mock<RssFeedDao>();
    itemDao = mock<RssItemDao>();
    feedParser = mock<FeedParser>();
    http = mock<Http>();

    rss = new Rss(feedDao, itemDao, feedParser, http);
  });

  it("gets all feeds", async () => {
    feedDao.getFeeds = async () => generateNumOfFeeds(10);
    const result = await rss.getFeeds();
    expect(result.length).toEqual(10);
    verify(feedDao.getFeeds).calledOnce();
  });

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
  })
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
