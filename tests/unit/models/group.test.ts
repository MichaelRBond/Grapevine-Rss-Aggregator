import { GroupDao } from "../../../src/dao/group";
import { Group, GroupBase, GroupModel } from "../../../src/models/group";
import { Mock, mock, verify } from "../../utils/mockfill";

describe("Unit: group model", () => {
  let groupDao: Mock<GroupDao>;
  let model: GroupModel;

  let groupBase: GroupBase;
  let groupResult: Group;

  beforeEach(() => {
    groupDao = mock<GroupDao>();
    model = new GroupModel(groupDao);

    groupBase = {
      name: "test1",
    };

    groupResult = {
      ...groupBase,
      id: 1,
    };
  });

  it("saves a group to the database", async () => {
    groupDao.save = async () => groupResult;
    const group = await model.save(groupBase);
    expect(group).not.toBeNull();
    expect(group.id).toEqual(1);
    expect(group.name).toEqual(groupBase.name);
  });

  it("throws an error when it cannot save a group to the databsae", async () => {
    groupDao.save = async () => null;
    try {
      await model.save(groupBase);
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err.message).toEqual("Unable to save group");
    }
  });

  it("updates a group in the database", async () => {
    groupDao.getById = async () => ({}) as Group;
    groupDao.update = async () => groupResult;
    const group = await model.update(1, groupBase);
    expect(group).not.toBeNull();
    expect(group.id).toEqual(1);
    expect(group.name).toEqual(groupBase.name);
  });

  it("returns null if group cannot be found for updating", async () => {
    groupDao.getById = async () => null;
    const group = await model.update(1, groupBase);
    expect(group).toBeNull();
  });

  it("throws an error when it cannot update a group in the database", async () => {
    groupDao.getById = async () => ({}) as Group;
    groupDao.update = async () => null;
    try {
      await model.update(1, groupBase);
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err.message).toEqual("Unable to update group");
    }
  });
});
