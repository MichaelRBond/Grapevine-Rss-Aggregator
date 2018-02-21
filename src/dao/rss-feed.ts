import { MySqlClient } from "../clients/mysql-client";
import { Nullable } from "../models/nullable";
import { RssFeed, RssFeedBase } from "../models/rss";
import { DateTime } from "../utils/date-time";

export class RssFeedDao {
  constructor(
    private mysqlProvider: () => MySqlClient,
    private dateTime: DateTime,
  ) { /* */ }

  public async getById(id: number): Promise<Nullable<RssFeed>> {
    const mysql = this.mysqlProvider();
    const sql = "SELECT * FROM `feeds` WHERE id=?";
    const result = await mysql.query(sql, [id]);
    if (result.length === 0) {
      return null; // TODO : Optional
    }
    return this.dbToRssFeed(result[0]);
  }

  public async getFeeds(): Promise<RssFeed[]> {
    const mysql = this.mysqlProvider();
    const result = await mysql.query("SELECT * FROM `feeds`");
    return result.map(this.dbToRssFeed);
  }

  public async save(feed: RssFeedBase): Promise<Nullable<RssFeed>> {
    const mysql = this.mysqlProvider();
    const sql = "INSERT INTO `feeds` (`title`, `url`, `addedOn`) VALUES(?, ?, ?)";
    const result = await mysql.insertUpdate(sql, [feed.title, feed.url, this.dateTime.dateNoWInSeconds()]);
    return this.getById(result.insertId);
  }

  public async update(feed: RssFeed): Promise<Nullable<RssFeed>> {
    const mysql = this.mysqlProvider();
    const sql = "UPDATE `feeds` SET `title`=?, `url`=? WHERE `id`=?";
    await mysql.insertUpdate(sql, [feed.title, feed.url, feed.id]);
    return this.getById(feed.id);
  }

  private dbToRssFeed(result: any): RssFeed {
    return {
      addedOn: result.addedOn,
      id: result.id,
      lastUpdated: result.lastUpdated,
      title: result.title,
      url: result.url,
    };
  }
}
