import { MySqlClient, OkPacket } from "../../../src/clients/mysql-client";
import { RssFeedDao } from "../../../src/dao/rss-feed";
import { RssFeedBase } from "../../../src/models/rss";
import { DateTime } from "../../../src/utils/date-time";
import { Mock, mock, verify } from "../../utils/mockfill";

describe("Unit: rss-feed dao", () => {

  let mysql: Mock<MySqlClient>;
  let dateTime: Mock<DateTime>;
  let dao: RssFeedDao;

  beforeEach(() => {
    mysql = mock<MySqlClient>();
    dateTime = mock<DateTime>();
    dao = new RssFeedDao(() => mysql, dateTime);
  });

  describe("save()", () => {
    it("returns null when it cannot save a feed", async () => {
      mysql.insertUpdate = async () => ({} as OkPacket);
      const result = await dao.save({} as RssFeedBase);
      expect(result).toBeNull();
      verify(mysql.insertUpdate).calledOnce();
    });
  });

});
