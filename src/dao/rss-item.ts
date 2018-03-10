import { isNullOrUndefined } from "util";
import { MySqlClient } from "../clients/mysql-client";
import { Nullable } from "../models/nullable";
import { RssFeed, RssItem, RssItemBase } from "../models/rss";
import { getUnixtimeFromDate } from "../utils/helpers";
import { getGuid } from "../utils/rss";

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
    const guid = getGuid(item);

    const result = await mysql.insertUpdate(sql, [feed.id, item.title, item.description, item.summary, item.link,
      updated, published, item.author, guid, image, categories, enclosures]);

    // TODO : check for error in result. Throw new error

    return this.getById(result.insertId);
  }

  public async update(item: RssItemBase): Promise<Nullable<RssItem>> {
    const guid = getGuid(item);
    const mysql = this.mysqlProvider();
    const sql = "UPDATE `items` SET `title`=?, `description`=?, `summary`=?, `updated`=?, `published`=?, `author`=?, "
      + "`image`=?, `categories`=?, `enclosures`=? WHERE `guid`=?";

    // FIXME: Refactor
    const updated = isNullOrUndefined(item.updated) ? null : getUnixtimeFromDate(item.updated);
    const published = isNullOrUndefined(item.published) ? null : getUnixtimeFromDate(item.published);
    const image = JSON.stringify(item.image);
    const categories = JSON.stringify(item.categories);
    const enclosures = JSON.stringify(item.enclosures);

    const result = await mysql.insertUpdate(sql, [item.title, item.description, item.summary, updated, published,
      item.author, image, categories, enclosures, guid]);

    if (result.affectedRows !== 1) {
      throw new Error("Error updating Rss Feed item");
    }

    return this.getByGuid(guid);
  }

  public async getById(id: number): Promise<Nullable<RssItem>> {
    const mysql = this.mysqlProvider();
    const result = await mysql.query("SELECT * FROM `items` WHERE `id`=?", [id]);
    if (result.length === 0) {
      return null; // TODO : Optional
    }
    return this.dbToRssItem(result[0]);
  }

  public async getByGuid(guid: string): Promise<Nullable<RssItem>> {
    const mysql = this.mysqlProvider();
    const result = await mysql.query("SELECT * FROM `items` WHERE `guid`=?", [guid]);
    if (result.length === 0) {
      return null; // TODO : optional
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
