import { MySqlClient, OkPacket } from "../../../src/clients/mysql-client";
import { GroupDao } from "../../../src/dao/group";
import { Mock, mock, verify } from "../../utils/mockfill";

describe("Unit: group dao", () => {

  let mysql: Mock<MySqlClient>;
  let dao: GroupDao;

  beforeEach(() => {
    mysql = mock<MySqlClient>();
    dao = new GroupDao(() => mysql);
  });

  describe("addFeedToGroup()", () => {
    it("throws an error if insert fails", async () => {
      mysql.insertUpdate = async () => ({} as OkPacket);
      try {
        await dao.addFeedToGroup(1, 2);
        fail();
      } catch (err) {
        expect(err.message).toEqual("Error adding feed=1 to group=2");
      }
      verify(mysql.insertUpdate).calledOnce();
    });
  });
});
