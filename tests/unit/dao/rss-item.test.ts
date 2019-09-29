import { MySqlClient } from "../../../src/clients/mysql-client";
import { RssItemDao } from "../../../src/dao/rss-item";
import { Mock, mock } from "../../utils/mockfill";

describe("Unit: Rss Item", () => {

  let mysql: Mock<MySqlClient>;
  let dao: RssItemDao;

  beforeEach(() => {
    mysql = mock<MySqlClient>();
    dao = new RssItemDao(() => mysql);
  });

  describe("buildWhereClause()", () => {
    it("returns an empty string if all parameters are null", () => {
      const result = dao.buildWhereClause();
      expect(result).toEqual("");
    });

    it("returns a where clause with only a feedId", () => {
      const result = dao.buildWhereClause(1);
      expect(result).toEqual("WHERE `feedId`=?");
    });

    it("returns a where clause with only starred is true", () => {
      const result = dao.buildWhereClause(undefined, undefined, true);
      expect(result).toEqual("WHERE `starred`=1");
    });

    it("returns a where clause with only starred is false", () => {
      const result = dao.buildWhereClause(undefined, undefined, false);
      expect(result).toEqual("WHERE `starred`=0");
    });

    it("returns a where clause with only read is true", () => {
      const result = dao.buildWhereClause(undefined, true, undefined);
      expect(result).toEqual("WHERE `read`=1");
    });

    it("returns a where clause with only read is false", () => {
      const result = dao.buildWhereClause(undefined, false, undefined);
      expect(result).toEqual("WHERE `read`=0");
    });

    it("returns a where clause where both read and starred are provided", () => {
      const result = dao.buildWhereClause(undefined, true, false);
      expect(result).toEqual("WHERE `read`=1 AND `starred`=0");
    });

    it("returns a where clause where feedId and both read and starred are provided", () => {
      const result = dao.buildWhereClause(1, true, false);
      expect(result).toEqual("WHERE `feedId`=? AND `read`=1 AND `starred`=0");
    });
  });
});
