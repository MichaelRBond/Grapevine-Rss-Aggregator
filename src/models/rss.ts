import {RssDao} from "../dao/rss";

export interface RssFeedBase {
  title: string;
  url: string;
}

export interface RssFeed extends RssFeedBase {
  id: number;
  addedOn: number;
  lastUpdated: number;
}

export class Rss {

  constructor(private dao: RssDao) { /* */ }

  public async saveFeed(): Promise<RssFeed> {
    // TODO:
    await this.dao.save();
    return {} as RssFeed;
  }

}
