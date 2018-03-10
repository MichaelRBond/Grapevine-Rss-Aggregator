import { AxiosRequestConfig, AxiosResponse } from "axios";
import * as FP from "feedparser";
import { isNullOrUndefined } from "util";
import { RssFeedDao } from "../dao/rss-feed";
import { RssItemDao } from "../dao/rss-item";
import { FeedParser } from "../utils/feed-parser";
import { isBlank } from "../utils/helpers";
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
    private feedDdao: RssFeedDao,
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

  public async getFeeds(): Promise<RssFeed[]> {
    return this.feedDdao.getFeeds();
  }

  public async saveFeed(feed: RssFeedBase): Promise<Nullable<RssFeed>> {
    return this.feedDdao.save(feed);
  }

  public async updateFeed(feed: RssFeed): Promise<Nullable<RssFeed>> {
    return this.feedDdao.update(feed);
  }

  public async fetchFeeds(): Promise<void> {
    const feeds = await this.getFeeds();
    feeds.forEach(async (f) => {
      const feed = await this.fetchFeed(f);
      const items = await this.feedParser.parse(feed, f.url);
      await this.saveItems(feed, items);
    });
    return;
  }

  private async saveItems(feed: RssFeed, items: RssItemBase[]): Promise<Array<Nullable<RssItem>>> {
    const savePromises = items.map(async (i) => {
      return this.itemDao.getByGuid(getGuid(i)) ? this.itemDao.update(i) : this.itemDao.save(i, feed);
    });
    return Promise.all(savePromises);
  }

  private async fetchFeed(feed: RssFeed): Promise<any> {
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

export function rssItemBaseFromFeedParser(item: FP.Item): RssItemBase {
  return {
    author: item.author,
    categories: item.categories,
    comments: item.comments, // a link to the article's comments section
    description: item.description,
    enclosures: item.enclosures,
    guid: getGuid(item),
    image: item.image,
    link: isBlank(item.origlink) ? item.link : item.origlink,
    published: isNullOrUndefined(item.pubdate) ? item.date : item.pubdate, // when originally published
    summary: item.summary,
    title: item.title,
    updated: isNullOrUndefined(item.date) ? item.pubdate : item.date, // most recent update
  };
}
