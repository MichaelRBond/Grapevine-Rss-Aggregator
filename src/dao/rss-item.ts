import { isNullOrUndefined } from "util";
import { MySqlClient } from "../clients/mysql-client";
import { Nullable } from "../models/nullable";
import { RssFeed, RssItem, RssItemBase } from "../models/rss";
import { getUnixtimeFromDate } from "../utils/helpers";

export class RssItemDao {
  constructor(
    private mysqlProvider: () => MySqlClient,
  ) { /* */ }

  public async save(item: RssItemBase, feed: RssFeed): Promise<Nullable<RssItem>> {
    const mysql = this.mysqlProvider();
    const sql = "INSERT INTO `items` (`feedId`, `title`, `description`, `summary`, `link`, `updated`, `published`, "
    + "`author`, `guid`, `image`, `categories`, `enclosures`) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    const updated = isNullOrUndefined(item.updated) ? null : getUnixtimeFromDate(item.updated);
    const published = isNullOrUndefined(item.published) ? null : getUnixtimeFromDate(item.published);
    const image = JSON.stringify(item.image);
    const categories = JSON.stringify(item.categories);
    const enclosures = JSON.stringify(item.enclosures);

    const result = await mysql.insertUpdate(sql, [feed.id, item.title, item.description, item.summary, item.link,
      updated, published, item.author, item.guid, image, categories, enclosures]);
    return this.getById(result.insertId);
  }

  public async getById(id: number): Promise<Nullable<RssItem>> {
    const mysql = this.mysqlProvider();
    const result = await mysql.query("SELECT * FROM `items` WHERE `id`=?", [id]);
    if (result.length === 0) {
      return null; // TODO : Optional
    }
    return this.dbToRssItem(result[0]);
  }

  private dbToRssItem(result: any): RssItem {
    return {
      author: result.author,
      categories: JSON.parse(result.categories),
      comments: result.comments,
      description: result.description,
      enclosures: JSON.parse(result.enclosures),
      feedId: result.feedId,
      guid: result.guid,
      id: result.id,
      image: result.image,
      link: result.link,
      published: result.published ? new Date(result.published * 1000) : null,
      read: result.read,
      starred: result.read === 1,
      summary: result.summary,
      title: result.title,
      updated: result.updated ? new Date(result.updated * 1000) : null,
    };
  }
}
