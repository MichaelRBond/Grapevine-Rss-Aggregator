import { Nullable } from "nullable-ts";
import { AccountDao } from "../dao/accounts";

export interface AccountBase {
  username: string;
  salt: string;
  apikeyHash: string;
}

export interface Account extends AccountBase {
  id: number;
  addedOn: number;
  lastUpdated: number;
}

export class AccountModel {
  constructor(
    private accountDao: AccountDao,
  ) { }

  public async save(account: AccountBase): Promise<Nullable<Account>> {
    // TODO: Validate account here
    return this.accountDao.save(account);
  }

  public async update(account: Account): Promise<Nullable<Account>> {
    return this.accountDao.update(account);
  }

  public getById(id: number): Promise<Nullable<Account>> {
    return this.accountDao.getById(id);
  }

  public getByUsername(username: string): Promise<Nullable<Account>> {
    return this.accountDao.getByUsername(username);
  }

}
