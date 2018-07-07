import { AccountDao } from "../../../src/dao/accounts";
import { Account, AccountBase, AccountModel } from "../../../src/models/accounts";
import { Mock, mock } from "../../utils/mockfill";

describe("Unit: accounts model", () => {
  let accountDao: Mock<AccountDao>;
  let model: AccountModel;

  beforeEach(() => {
    accountDao = mock<AccountDao>();
    model = new AccountModel(accountDao);
  });

  describe("save", () => {
    it("returns an account", async () => {
      accountDao.save = async () => ({} as Account);
      expect(await model.save({} as AccountBase)).not.toBeNull();
    });
  });

  describe("update", () => {
    it("returns an account", async () => {
      accountDao.update = async () => ({} as Account);
      expect(await model.update({} as Account)).not.toBeNull();
    });
  });

  describe("getById", () => {
    it("returns an account", async () => {
      accountDao.getById = async () => ({} as Account);
      expect(await model.getById(1)).not.toBeNull();
    });
  });

  describe("getByUsername", () => {
    it("returns an account", async () => {
      accountDao.getByUsername = async () => ({} as Account);
      expect(await model.getByUsername("foo")).not.toBeNull();
    });
  });
});
