import {RssDao} from "../dao/rss";
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

export class Rss {

  constructor(private dao: RssDao) { /* */ }

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
    return this.dao.getFeeds();
  }

  public async saveFeed(feed: RssFeedBase): Promise<Nullable<RssFeed>> {
    return this.dao.save(feed);
  }

  public async updateFeed(feed: RssFeed): Promise<Nullable<RssFeed>> {
    return this.dao.update(feed);
  }
}
