import { isNullOrUndefined, Nullable } from "nullable-ts";
import { MySqlClient } from "../clients/mysql-client";
import { Account, AccountBase } from "../models/accounts";
import { getUnixtime } from "../utils/helpers";

export class AccountDao {
  constructor(
    private mysqlProvider: () => MySqlClient,
  ) { }

  public async save(account: AccountBase): Promise<Nullable<Account>> {
    const addedOn = getUnixtime();
    const lastUpdated = addedOn;
    const sql = "INSERT INTO `accounts` (`username`, `addedOn`, `lastUpdated`, `salt`, `apikeyHash`) "
      + "VALUES(?, ?, ?, ?, ?)";
    const result = await this.mysqlProvider().insertUpdate(sql,
      [account.username, addedOn, lastUpdated, account.salt, account.apikeyHash]);
    if (isNullOrUndefined(result.insertId)) {
      throw new Error("Error saving account");
    }
    return this.getById(result.insertId);
  }

  public async update(account: Account): Promise<Nullable<Account>> {
    const lastUpdated = getUnixtime();
    const sql = "UPDATE `accounts` SET `salt`=?, `apikeyHash`=?, `lastUpdated`=? WHERE `id`=?";
    const result = await this.mysqlProvider().insertUpdate(sql,
      [account.salt, account.apikeyHash, lastUpdated, account.id]);
    if (result.affectedRows !== 1) {
      throw new Error(`Error updating account id=${account.id}`);
    }
    return this.getById(account.id);
  }

  public async getById(id: number): Promise<Nullable<Account>> {
    const sql = "SELECT * FROM `accounts` WHERE `id`=?";
    const result = await this.mysqlProvider().query(sql, [id]);
    return this.validateAndReturnGetResult(result);
  }

  public async getByUsername(username: string): Promise<Nullable<Account>> {
    const sql = "SELECT * FROM `accounts` WHERE `username`=?";
    const result = await this.mysqlProvider().query(sql, [username]);
    return this.validateAndReturnGetResult(result);
  }

  private validateAndReturnGetResult(result: Account[]): Nullable<Account> {
    if (result.length === 0) {
      return null;
    }
    if (result.length > 1) {
      throw new Error(`Invalid number of accounts returned`);
    }
    return this.accountFromDb(result[0]);
  }

  private accountFromDb(result: Account) {
    return {
      addedOn: result.addedOn,
      apikeyHash: result.apikeyHash,
      id: result.id,
      lastUpdated: result.lastUpdated,
      salt: result.salt,
      username: result.username,
    };
  }
}
