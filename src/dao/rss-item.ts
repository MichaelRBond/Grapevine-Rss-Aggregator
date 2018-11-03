import { isNotNullorUnDefined, isNullOrUndefined, Nullable } from "nullable-ts";
import { MySqlClient } from "../clients/mysql-client";
import { RssFeed, RssItem, RssItemBase } from "../models/rss";
import { getUnixtimeFromDate, isBlank } from "../utils/helpers";
import { logger } from "../utils/logger";
import { getGuid } from "../utils/rss";

export type DbStatusFields = "read" | "starred";

export class RssItemDao {
  constructor(
    private mysqlProvider: () => MySqlClient,
  ) { /* */ }

  public async save(item: RssItemBase, feed: RssFeed): Promise<Nullable<RssItem>> {
    const mysql = this.mysqlProvider();
    const sql = "INSERT INTO `items` (`feedId`, `title`, `description`, `summary`, `link`, `updated`, `published`, "
    + "`author`, `guid`, `image`, `categories`, `enclosures`, `comments`) "
    + "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    const updated = isNullOrUndefined(item.updated) ? null : getUnixtimeFromDate(item.updated as Date);
    const published = isNullOrUndefined(item.published) ? null : getUnixtimeFromDate(item.published as Date);
    const comments = isNullOrUndefined(item.comments) ? null : item.comments;
    const image = JSON.stringify(item.image);
    const categories = JSON.stringify(item.categories);
    const enclosures = JSON.stringify(item.enclosures);
    const guid = getGuid(item);

    const result = await mysql.insertUpdate(sql, [feed.id, item.title, item.description, item.summary, item.link,
      updated, published, item.author, guid, image, categories, enclosures, comments]);

    // TODO : check for error in result. Throw new error

    return this.getById(result.insertId);
  }

  public async update(item: RssItemBase): Promise<Nullable<RssItem>> {
    const guid = getGuid(item);
    const mysql = this.mysqlProvider();
    const sql = "UPDATE `items` SET `title`=?, `description`=?, `summary`=?, `updated`=?, `published`=?, `author`=?, "
      + "`image`=?, `categories`=?, `enclosures`=?, `comments`=? WHERE `guid`=?";

    // FIXME: Refactor
    const updated = isNullOrUndefined(item.updated) ? null : getUnixtimeFromDate(item.updated as Date);
    const published = isNullOrUndefined(item.published) ? null : getUnixtimeFromDate(item.published as Date);
    const image = JSON.stringify(item.image);
    const categories = JSON.stringify(item.categories);
    const enclosures = JSON.stringify(item.enclosures);
    const comments = isNullOrUndefined(item.comments) ? null : item.comments;

    const result = await mysql.insertUpdate(sql, [item.title, item.description, item.summary, updated, published,
      item.author, image, categories, enclosures, comments, guid]);

    if (result.affectedRows !== 1) {
      throw new Error("Error updating Rss Feed item");
    }

    return this.getByGuid(guid);
  }

  public async getById(id: number): Promise<Nullable<RssItem>> {
    const sql = this.getSql("WHERE `items`.`id`=?");
    const mysql = this.mysqlProvider();
    const result = await mysql.query(sql, [id]);
    if (result.length === 0) {
      return null;
    }
    return this.dbToRssItem(result[0]);
  }

  public async getByGuid(guid: string): Promise<Nullable<RssItem>> {
    const sql = this.getSql("WHERE `items`.`guid`=?");
    const mysql = this.mysqlProvider();
    const result = await mysql.query(sql, [guid]);
    if (result.length === 0) {
      return null;
    }
    return this.dbToRssItem(result[0]);
  }

  public async getByFeed(feedId: number, read?: Nullable<boolean>, starred?: Nullable<boolean>): Promise<RssItem[]> {
    const where = this.buildWhereClause(feedId, read, starred);
    const sql = this.getSql(where);
    const result = await this.mysqlProvider().query(sql, [feedId]);
    return result.map(this.dbToRssItem);
  }

  public async getItems(read?: Nullable<boolean>, starred?: Nullable<boolean>): Promise<RssItem[]> {
    const where = this.buildWhereClause(null, read, starred);
    const sql = this.getSql(where);
    const result = await this.mysqlProvider().query(sql);
    return result.map(this.dbToRssItem);
  }

  public async setItemStatus(id: number, type: DbStatusFields, status: boolean): Promise<void> {
    const value = status === true ? 1 : 0;
    const sql = "UPDATE `items` SET `" + type + "`=? WHERE `id`=?";
    const result = await this.mysqlProvider().insertUpdate(sql, [value, id]);
    if (result.affectedRows !== 1) {
      logger.error(`Error updating status type=${type} to ${value}`, result.message);
      throw new Error("Error updating item status");
    }
    return;
  }

  // visible for testing
  public getSql(where: string): string {
    return "SELECT `items`.*, `feeds`.`title` as `feedTitle` FROM `items`"
      + " LEFT JOIN `feeds` ON `feeds`.`id`=`items`.`feedId`"
      + where;
  }

  // visible for testing
  public buildWhereClause(feedId?: Nullable<number>, read?: Nullable<boolean>, starred?: Nullable<boolean>): string {
    const clauses: string[] = [];

    if (isNotNullorUnDefined(feedId)) {
      clauses.push("`feedId`=?");
    }
    if (isNotNullorUnDefined(read)) {
      clauses.push("`read`=" + (read ? "1" : "0"));
    }
    if (isNotNullorUnDefined(starred)) {
      clauses.push("`starred`=" + (starred ? "1" : "0"));
    }

    const joined = clauses.join(" AND ");
    return isBlank(joined) ? "" : `WHERE ${joined}`;
  }

  private dbToRssItem(result: any): RssItem {
    return {
      author: result.author,
      categories: JSON.parse(result.categories),
      comments: result.comments,
      description: result.description,
      enclosures: JSON.parse(result.enclosures),
      feedId: result.feedId,
      feedTitle: result.feedTitle,
      guid: result.guid,
      id: result.id,
      image: result.image,
      link: result.link,
      published: result.published ? new Date(result.published * 1000) : null,
      read: result.read === 1,
      starred: result.starred === 1,
      summary: result.summary,
      title: result.title,
      updated: result.updated ? new Date(result.updated * 1000) : null,
    };
  }
}
