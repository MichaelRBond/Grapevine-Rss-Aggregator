import { mysqlClientEnd, mysqlClientProvider } from "../../../src/clients/mysql-client";
import { AccountDao } from "../../../src/dao/accounts";
import { Account, AccountBase } from "../../../src/models/accounts";
import { sleep } from "../../../src/utils/helpers";
import { resetTables } from "../../utils/mysql";

describe("Integration: accounts dao", () => {
  let accountBase: AccountBase;
  let dao: AccountDao;

  beforeEach(async () => {
    await resetTables(mysqlClientProvider);

    dao = new AccountDao(mysqlClientProvider);

    accountBase = {
      apikeyHash: "myHash",
      salt: "mySalt",
      username: "myUsername",
    } as AccountBase;
  });

  afterAll(async () => {
    await mysqlClientEnd();
  });

  describe("save()", () => {
    it("saves and retrieves an account from the datbaase", async () => {
      const account = await dao.save(accountBase);
      expect(account).toHaveProperty("username", accountBase.username);
      expect(account).toHaveProperty("salt", accountBase.salt);
      expect(account).toHaveProperty("apikeyHash", accountBase.apikeyHash);
      expect(account).toHaveProperty("id");
      expect(account).toHaveProperty("addedOn");
      expect(account).toHaveProperty("lastUpdated");
      expect(account.addedOn).toEqual(account.lastUpdated);

      const mysql = mysqlClientProvider();
      const result = await mysql.query("SELECT * FROM `accounts`");
      expect(result.length).toEqual(1);

      expect(account.id).toEqual(result[0].id);
    });
  });

  describe("update()", () => {
    it("updates an existing account", async () => {
      const account = await dao.save(accountBase);

      const updatedAccount: Account = {
        ...account,
        apikeyHash: "newHash",
        salt: "newSalt",
        username: "newUsername",
      };

      await sleep(1000);

      const updatedAccountResult = await dao.update(updatedAccount);
      expect(updatedAccountResult).toHaveProperty("username", accountBase.username);
      expect(updatedAccountResult).toHaveProperty("salt", "newSalt");
      expect(updatedAccountResult).toHaveProperty("apikeyHash", "newHash");
      expect(updatedAccountResult).toHaveProperty("id");
      expect(updatedAccountResult).toHaveProperty("addedOn");
      expect(updatedAccountResult).toHaveProperty("lastUpdated");
      expect(account.id).toEqual(updatedAccountResult.id);
      expect(account.addedOn).toEqual(updatedAccountResult.addedOn);
      expect(account.lastUpdated).not.toEqual(updatedAccountResult.lastUpdated);

      const mysql = mysqlClientProvider();
      const result = await mysql.query("SELECT * FROM `accounts`");
      expect(result.length).toEqual(1);
    });

    it("throws an error when an account doesn't exist", async () => {
      const account: Account = {
        ...accountBase,
        addedOn: 1,
        id: 42,
        lastUpdated: 2,
      };
      try {
        const updatedAccount = await dao.update(account);
        fail();
      } catch (err) {
        expect(err.message).toEqual("Error updating account id=42");
      }
    });
  });

  describe("getById()", () => {
    it("returns null when no id is found", async () => {
      const account = await dao.getById(42);
      expect(account).toBeNull();
    });

    it("returns a valid account", async () => {
      const account = await dao.save(accountBase);
      const retrievedAccount = await dao.getById(account.id);
      expect(retrievedAccount).not.toBeNull();
    });
  });

  describe("getByName()", () => {
    it("returns null when no id is found", async () => {
      const account = await dao.getByUsername("foo");
      expect(account).toBeNull();
    });

    it("returns a valid account", async () => {
      const account = await dao.save(accountBase);
      const retrievedAccount = await dao.getByUsername(account.username);
      expect(retrievedAccount).not.toBeNull();
    });
  });
});
