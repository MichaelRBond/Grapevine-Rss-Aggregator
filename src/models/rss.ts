import { AxiosRequestConfig, AxiosResponse } from "axios";
import { isNullOrUndefined, Nullable, orElseThrow } from "nullable-ts";
import { config } from "../config";
import { GroupDao } from "../dao/group";
import { RssFeedDao } from "../dao/rss-feed";
import { DbStatusFields, RssItemDao } from "../dao/rss-item";
import { DateTime } from "../utils/date-time";
import { FeedParser } from "../utils/feed-parser";
import { getUnixtimeFromDate } from "../utils/helpers";
import { AXIOS_STATUS_CODES, Http } from "../utils/http";
import { logger } from "../utils/logger";
import { getGuid } from "../utils/rss";

export enum ItemFlags {
  read = "read",
  starred = "starred",
  unread = "unread",
  unstarred = "unstarred",
}

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
  title?: string;
  url?: string;
}

export interface RssItemBase {
  author: string;
  categories: string[];
  comments: string; // a link to the article's comments section
  description: string;
  enclosures: string[];
  guid: string;
  image: Nullable<RssItemImage>;
  link: string;
  published: Nullable<Date>;
  summary: string;
  title: string;
  updated: Nullable<Date>;
}

export interface RssItem extends RssItemBase {
  id: number;
  feedId: number;
  feedTitle: string;
  read: boolean;
  starred: boolean;
}

export interface RssItemApiResponse {
  id: number;
  feed: {
    id: number;
    title: string;
  };
  read: boolean;
  starred: boolean;
  title: string;
  description: string;
  summary: string;
  link: string;
  updated: Nullable<Date>;
  published: Nullable<Date>;
  author: string;
  guid: string;
  comments: string; // a link to the article's comments section
  image: Nullable<RssItemImage>;
  categories: string[];
  enclosures: any[];
}

export class RssModel {

  constructor(
    private feedDao: RssFeedDao,
    private itemDao: RssItemDao,
    private groupDao: GroupDao,
    private feedParser: FeedParser,
    private http: Http,
    private dateTime: DateTime,
    private expirationAgeInSeconds: number = config.expireItemsInSeconds,
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

  public getFeed(id: number): Promise<Nullable<RssFeed>> {
    return this.feedDao.getById(id);
  }

  public getFeeds(): Promise<RssFeed[]> {
    return this.feedDao.getFeeds();
  }

  public async saveFeed(feed: RssFeedBase): Promise<Nullable<RssFeed>> {
    const feedIdNullable = await this.feedDao.save(feed);
    if (isNullOrUndefined(feedIdNullable)) {
      return null;
    }
    const feedId = orElseThrow(feedIdNullable, new Error("Error saving seed"));
    return this.feedDao.getById(feedId);
  }

  public async updateFeed(feed: RssFeed): Promise<Nullable<RssFeed>> {
    const feedIdNullable = await this.feedDao.update(feed);
    if (isNullOrUndefined(feedIdNullable)) {
      return null;
    }
    const feedId = orElseThrow(feedIdNullable, new Error("Error saving seed"));
    return this.feedDao.getById(feedId);
  }

  public async deleteFeed(feedId: number): Promise<void> {
    logger.info(`Deleting feed with id=${feedId}`);
    const feedIdNullable = await this.feedDao.getById(feedId);
    if (isNullOrUndefined(feedIdNullable)) {
      logger.error(`Attempted to delete feed id=${feedId}, which does not exist`);
      return;
    }
    await this.itemDao.deleteItemsFromFeed(feedId);
    await this.groupDao.removeFeedFromGroups(feedId);
    await this.feedDao.delete(feedId);
    return;
  }

  public async fetchFeeds(): Promise<void> {
    logger.info("Fetching RSS Feeds");
    const feeds = await this.getFeeds();
    const fetchPromises = feeds.map(async (feed) => {
      let rss: any; // TODO : type better
      try {
        rss = await this.fetchRss(feed);
      } catch (err) {
        logger.error(err.message);
        return;
      }
      const items = await this.feedParser.parse(rss);
      return this.saveItems(feed, items);
    });
    await Promise.all(fetchPromises);
    return;
  }

  public async getFeedItems(feedId: number, read?: Nullable<boolean>, starred?: Nullable<boolean>): Promise<RssItem[]> {
    return this.itemDao.getByFeed(feedId, read, starred);
  }

  public async getItems(read?: Nullable<boolean>, starred?: Nullable<boolean>): Promise<RssItem[]> {
    return this.itemDao.getItems(read, starred);
  }

  public rssItemToApiResponse(rssItem: RssItem): RssItemApiResponse {
    return {
      author: rssItem.author,
      categories: rssItem.categories,
      comments: rssItem.comments,
      description: rssItem.description,
      enclosures: rssItem.enclosures,
      feed: {
        id: rssItem.feedId,
        title: rssItem.feedTitle,
      },
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
    };
  }

  public async getItemById(id: number): Promise<Nullable<RssItem>> {
    return this.itemDao.getById(id);
  }

  public async setItemStatus(id: number[], flag: ItemFlags): Promise<void> {
    let value: boolean;
    let statusType: DbStatusFields;

    switch (flag) {
      case ItemFlags.read:
        statusType = "read";
        value = true;
        break;
      case ItemFlags.unread:
        statusType = "read";
        value = false;
        break;
      case ItemFlags.starred:
        statusType = "starred";
        value = true;
        break;
      case ItemFlags.unstarred:
        statusType = "starred";
        value = false;
        break;
      default:
        throw new Error("Invalid status flag provided");
    }

    return this.itemDao.setItemStatus(id, statusType, value);
  }

  public async deleteExpiredItems(): Promise<void> {
    const expirationDate = this.getItemExpirationDate();
    const numItemsDeleted = await this.itemDao.deleteExpiredItems(expirationDate);
    logger.info(`Deleted ${numItemsDeleted} expired RSS Items`);
    return;
  }

  private async saveItems(feed: RssFeed, items: RssItemBase[]): Promise<Array<Nullable<RssItem>>> {
    const savePromises = items.map(async (item) => {
      if (getUnixtimeFromDate(item.published as Date) <= this.getItemExpirationDate()) {
        return null;
      }
      return (await this.itemDao.getByGuid(getGuid(item))) ? this.itemDao.update(item) : this.itemDao.save(item, feed);
    });
    return await Promise.all(savePromises);
  }

  // TODO : type the return better
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
      return null;
    }
    return feedResponse.data;
  }

  private getItemExpirationDate(): number {
    return this.dateTime.dateNoWInSeconds() - this.expirationAgeInSeconds;
  }
}
