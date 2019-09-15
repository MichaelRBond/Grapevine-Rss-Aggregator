import { mysqlClientEnd, mysqlClientProvider } from "../../../src/clients/mysql-client";
import { GroupDao } from "../../../src/dao/group";
import { thrownErrMsg, transformErrors } from "../../../src/utils/errors";
import { resetTables } from "../../utils/mysql";

describe("Integration: group dao", () => {
  let groupDao: GroupDao;

  beforeEach(async () => {
    groupDao = new GroupDao(mysqlClientProvider);

    await resetTables(mysqlClientProvider);
  });

  afterAll(async () => {
    await mysqlClientEnd();
  });

  it("saves and retrieves a group to the database", async () => {
    const result = await groupDao.save({name: "test1"});
    expect(result).not.toBeNull();

    let group = await groupDao.getById(result.id);
    expect(group).not.toBeNull();
    expect(group.name).toEqual("test1");

    group = await groupDao.getByName("test1");
    expect(group).not.toBeNull();
    expect(group.id).toEqual(result.id);
  });

  it("returns a group if saving a name that already exists", async () => {
    const group = await groupDao.save({name: "test1"});
    const duplicate = await groupDao.save({name: "test1"});
    expect(duplicate.id).toEqual(group.id);
    expect(duplicate.name).toEqual(group.name);
  });

  it("returns the first group if more than 1 is returned from getByName()", async () => {
    const mysql = mysqlClientProvider();
    await mysql.query("INSERT INTO `groups` (`name`) VALUES('test1'), ('test1')");
    const group = await groupDao.getByName("test1");
    expect(group).not.toBeNull();
    expect(group.id).toEqual(1);
  });

  it("returns null if no group is found with getByName()", async () => {
    const group = await groupDao.getByName("foo");
    expect(group).toBeNull();
  });

  it("returns null if no datbase is found with getByid()", async () => {
    const group = await groupDao.getById(100);
    expect(group).toBeNull();
  });

  it("updates a group in the database", async () => {
    const group = await groupDao.save({name: "test1"});
    const updatedGroup = await groupDao.update(group.id, {name: "test2"});
    expect(updatedGroup.id).toEqual(group.id);
    expect(updatedGroup.name).toEqual("test2");
  });

  it("returns null if it cannot update a group", async () => {
    const group = await groupDao.update(100, {name: "test2"});
    expect(group).toBeNull();
  });

  it("returns all groups from the database", async () => {
    const mysql = mysqlClientProvider();
    const sql = "INSERT INTO `groups` (`name`) VALUES"
      + "('test1'), ('test2'), ('test3')";
    await mysql.query(sql);

    const groups = await groupDao.get();
    expect(groups.length).toEqual(3);
  });

  it("returns an empty array when there are no groups", async () => {
    const groups = await groupDao.get();
    expect(groups.length).toEqual(0);
  });

  it("deletes a group from the database", async () => {
    const mysql = mysqlClientProvider();
    const newGroup = await groupDao.save({name: "test1"});

    let check = await mysql.query("select * from groups");
    expect(check.length).toEqual(1);

    await groupDao.delete(newGroup.id);

    check = await mysql.query("select * from groups");
    expect(check.length).toEqual(0);
  });

  it("throws an error when there is an error deleting the database", async () => {
    try {
      await groupDao.delete(1);
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err.message).toEqual(transformErrors(thrownErrMsg.dbDelete, {affectedRows: "0"}));
    }
  });

  describe("addFeedToGroup", () => {
    it("adds a group to a feed", async () => {
      const mysql = mysqlClientProvider();
      await groupDao.addFeedToGroup(1, 2);
      const result = await mysql.query("SELECT * FROM `feedGroups`");
      expect(result.length).toEqual(1);
      expect(result[0]).toHaveProperty("feedId", 1);
      expect(result[0]).toHaveProperty("groupId", 2);
    });
  });

  describe("getGroupsForFeed", () => {
    it("returns the expected number of groups", async () => {
      await groupDao.save({name: "test1"});
      await groupDao.save({name: "test2"});
      await groupDao.save({name: "test3"});

      const mysql = mysqlClientProvider();
      await mysql.insertUpdate("INSERT INTO `feedGroups` (`feedId`, `groupId`) VALUES(1, 1), (1, 2), (1, 3)");

      const result = await groupDao.getGroupsForFeed(1);
      expect(result.length).toEqual(3);
      let c = 0;
      result.forEach((g) => {
        expect(g).toHaveProperty("id");
        expect(g).toHaveProperty("name", `test${++c}`);
      });
    });
  });

  describe("removeFeedFromGroup", () => {
    it("deletes a feed-group relationship", async () => {
      const mysql = mysqlClientProvider();
      await mysql.insertUpdate("INSERT INTO `feedGroups` (`feedId`, `groupId`) VALUES(1, 1), (1, 2), (1, 3), (2, 1)");

      let relationships = await mysql.query("SELECT * FROM `feedGroups`");
      expect(relationships.length).toEqual(4);

      groupDao.removeFeedFromGroup(1, 1);

      relationships = await mysql.query("SELECT * FROM `feedGroups`");
      expect(relationships.length).toEqual(3);
    });
  });

  describe("removeFeedFromGroups", () => {
    it("removes a feed from all groups", async () => {
      const mysql = mysqlClientProvider();
      await mysql.insertUpdate("INSERT INTO `feedGroups` (`feedId`, `groupId`) VALUES(1, 1), (1, 2), (1, 3), (2, 1)");

      let relationships = await mysql.query("SELECT * FROM `feedGroups`");
      expect(relationships.length).toEqual(4);

      groupDao.removeFeedFromGroups(1);

      relationships = await mysql.query("SELECT * FROM `feedGroups`");
      expect(relationships.length).toEqual(1);
    });
  });
});
