import { MySqlClient, OkPacket } from "../../../src/clients/mysql-client";
import { AccountDao } from "../../../src/dao/accounts";
import { Account, AccountBase } from "../../../src/models/accounts";
import { Mock, mock, verify } from "../../utils/mockfill";

describe("Unit: account dao", () => {
  let mysql: Mock<MySqlClient>;
  let dao: AccountDao;

  beforeEach(() => {
    mysql = mock<MySqlClient>();
    dao = new AccountDao(() => mysql);
  });

  describe("save()", () => {
    it("throws an error when MySQL is unable to save a new account", async () => {
      mysql.insertUpdate = async () => ({ } as OkPacket);
      try {
        await dao.save({} as AccountBase);
        fail();
      } catch (err) {
        expect(err.message).toEqual("Error saving account");
      }

      verify(mysql.insertUpdate).calledOnce();
    });
  });

  describe("getById()", () => {
    it("throws an error when there are more than 1 accounts found", async () => {
      mysql.query = async () => [{} as Account, {} as Account];
      try {
        await dao.getById(1);
        fail();
      } catch (err) {
        expect(err.message).toEqual("Invalid number of accounts returned");
      }
    });
  });

  describe("getByUsername()", () => {
    it("throws an error when there are more than 1 accounts found", async () => {
      mysql.query = async () => [{} as Account, {} as Account];
      try {
        await dao.getByUsername("foo");
        fail();
      } catch (err) {
        expect(err.message).toEqual("Invalid number of accounts returned");
      }
    });
  });
});
