import { AxiosRequestConfig, AxiosResponse } from "axios";
import { isNullOrUndefined } from "util";
import { RssFeedDao } from "../dao/rss-feed";
import { RssItemDao } from "../dao/rss-item";
import { FeedParser } from "../utils/feed-parser";
import { AXIOS_STATUS_CODES, Http } from "../utils/http";
import { getGuid } from "../utils/rss";
import { Nullable } from "./nullable";

export interface RssFeedBase {
  title: string;
  url: string;
}

export interface RssFeed extends RssFeedBase {
  addedOn: number;
  id: number;
  lastUpdated: number;
}

export interface RssFeedApiResponse {
  added_on: number;
  id: number;
  last_updated: number;
  title: string;
  url: string;
}

interface RssItemImage {
  url?: string;
  title?: string;
}

export interface RssItemBase {
  title: string;
  description: string;
  summary: string;
  link: string;
  updated: Nullable<Date>; // most recent update
  published: Nullable<Date>; // when originally published
  author: string;
  guid: string;
  comments: string; // a link to the article's comments section
  image: RssItemImage;
  categories: string[];
  enclosures: string[];
}

export interface RssItem extends RssItemBase {
  id: number;
  feedId: number;
  read: boolean;
  starred: boolean;
}

export class Rss {

  constructor(
    private feedDao: RssFeedDao,
    private itemDao: RssItemDao,
    private feedParser: FeedParser,
    private http: Http,
  ) { /* */ }

  public static rssFeedToApiResponse(feed: RssFeed): RssFeedApiResponse {
    return {
      added_on: feed.addedOn,
      id: feed.id,
      last_updated: feed.lastUpdated,
      title: feed.title,
      url: feed.url,
    };
  }

  public getFeeds(): Promise<RssFeed[]> {
    return this.feedDao.getFeeds();
  }

  public async saveFeed(feed: RssFeedBase): Promise<Nullable<RssFeed>> {
    const feedId = await this.feedDao.save(feed);
    if (isNullOrUndefined(feedId)) {
      return null;
    }
    return this.feedDao.getById(feedId);
  }

  public async updateFeed(feed: RssFeed): Promise<Nullable<RssFeed>> {
    const feedId = await this.feedDao.update(feed);
    if (isNullOrUndefined(feedId)) {
      return null;
    }
    return this.feedDao.getById(feedId);
  }

  public async fetchFeeds(): Promise<void> {
    const feeds = await this.getFeeds();
    const fetchPromises = feeds.map(async (feed) => {
      const rss = await this.fetchRss(feed);
      const items = await this.feedParser.parse(rss);
      return this.saveItems(feed, items);
    });
    await Promise.all(fetchPromises);
    return;
  }

  private async saveItems(feed: RssFeed, items: RssItemBase[]): Promise<Array<Nullable<RssItem>>> {
    // console.log(feed);
    const savePromises = items.map(async (i) => {
      return (await this.itemDao.getByGuid(getGuid(i))) ? this.itemDao.update(i) : this.itemDao.save(i, feed);
    });
    return await Promise.all(savePromises);
  }

  private async fetchRss(feed: RssFeed): Promise<any> {
    const requestParams: AxiosRequestConfig = {
      method: "GET",
      url: feed.url,
      validateStatus: AXIOS_STATUS_CODES.ALL,
    };
    let feedResponse: AxiosResponse;
    try {
      feedResponse = await this.http.request(requestParams);
    } catch (err) {
      throw new Error(`Error fetching feed: ${feed.title}`);
    }
    if (feedResponse.status !== 200) {
      return null; // TODO : switch to optional
    }
    return feedResponse.data;
  }
}
