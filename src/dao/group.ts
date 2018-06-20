import { isNullOrUndefined } from "util";
import { MySqlClient } from "../clients/mysql-client";
import { Group, GroupBase } from "../models/group";
import { Nullable } from "../models/nullable";
import { thrownErrMsg, transformErrors } from "../utils/errors";
import { logger } from "../utils/logger";

interface DbGroup {
  id: number;
  name: string;
}

export class GroupDao {
  constructor(
    private mysqlProvider: () => MySqlClient,
  ) { }

  public async save(group: GroupBase): Promise<Nullable<Group>> {
    const mysql = this.mysqlProvider();
    const groupByName = await this.getByName(group.name);
    if (!isNullOrUndefined(groupByName)) {
      return groupByName;
    }
    const sql = "INSERT INTO `groups` (`name`) VALUES(?)";
    const result = await mysql.insertUpdate(sql, [group.name]);
    return this.getById(result.insertId);
  }

  public async update(id: number, group: GroupBase): Promise<Nullable<Group>> {
    const mysql = this.mysqlProvider();
    const sql = "UPDATE `groups` SET `name`=? WHERE `id`=?";
    const result = await mysql.insertUpdate(sql, [group.name, id]);
    if (result.affectedRows !== 1) {
      return null;
    }
    return this.getById(id);
  }

  public async getById(id: number): Promise<Nullable<Group>> {
    const mysql = this.mysqlProvider();
    const sql = "SELECT * FROM `groups` WHERE `id`=?";
    const result = await mysql.query(sql, [id]);
    if (result.length === 0) {
      return null;
    }
    return this.dbToGroup(result[0]);
  }

  public async getByName(name: string): Promise<Nullable<Group>> {
    const mysql = this.mysqlProvider();
    const sql = "SELECT * FROM `groups` WHERE `name`=?";
    const result = await mysql.query(sql, [name]);
    if (result.length === 0) {
      return null;
    } else if (result.length > 1) {
      logger.warn(`Found ${result.length} groups matching name ${name}, returning first occurance`);
    }
    return this.dbToGroup(result[0]);
  }

  public async get(): Promise<Group[]> {
    const mysql = this.mysqlProvider();
    const sql = "SELECT * FROM `groups`";
    const result = await mysql.query(sql);
    return result.map(this.dbToGroup);
  }

  public async delete(id: number): Promise<void> {
    const mysql = this.mysqlProvider();
    const sql = "DELETE FROM `groups` WHERE `id`=? limit 1";
    const result = await mysql.query(sql, [id]);
    if (result.affectedRows !== 1) {
      throw new Error(transformErrors(thrownErrMsg.dbDelete, {affectedRows: result.affectedRows.toString()}));
    }
    return;
  }

  public async addFeedToGroup(feedId: number, groupId: number): Promise<void> {
    const mysql = this.mysqlProvider();
    const sql = "INSERT INTO `feedGroups` (`feedId`, `groupId`) VALUES(?, ?)";
    const result = await mysql.insertUpdate(sql, [feedId, groupId]);
    if (isNullOrUndefined(result.insertId)) {
      throw new Error(`Error adding feed=${feedId} to group=${groupId}`);
    }
    return;
  }

  public async getGroupsForFeed(feedId: number): Promise<Group[]> {
    const mysql = this.mysqlProvider();
    const sql = "SELECT `groupId` as `id`, `groups`.`name` FROM `feedGroups` LEFT JOIN `groups` ON `groups`.`id`="
      + "`feedGroups`.`groupId` WHERE `feedGroups`.`feedId`=?";
    const result = await mysql.query(sql, [feedId]);
    return result.map(this.dbToGroup);
  }

  public async removeFeedFromGroup(feedId: number, groupId: number): Promise<void> {
    const mysql = this.mysqlProvider();
    const sql = "DELETE FROM `feedGroups` WHERE `feedId`=? AND `groupId`=? LIMIT 1";
    await mysql.query(sql, [feedId, groupId]);
    return;
  }

  private dbToGroup(result: DbGroup) {
    return {
      id: result.id,
      name: result.name,
    };
  }
}
