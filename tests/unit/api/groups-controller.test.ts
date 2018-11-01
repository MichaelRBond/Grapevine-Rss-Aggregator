import { Request } from "hapi";
import { GroupsController } from "../../../src/api/groups-controller";
import { GroupModel } from "../../../src/models/group";
import { thrownErrMsg } from "../../../src/utils/errors";
import { Mock, mock, verify } from "../../utils/mockfill";

describe("Unit: groups controller", () => {
  let groupsModel: Mock<GroupModel>;
  let endpoint: GroupsController;

  beforeEach(() => {
    groupsModel = mock<GroupModel>();
    endpoint = new GroupsController(groupsModel);
  });

  it("registers routes", () => {
    const routes = endpoint.registerRoutes();
    expect(routes.length).toEqual(5);
  });

  it("creates a new group", async () => {
    const request = {
      payload: {
        name: "test1",
      },
    } as Request;
    groupsModel.save = async () => ({id: 1, name: "test1"});
    const result = await endpoint.create(request);
    expect(result.id).toEqual(1);
    expect(result.name).toEqual("test1");
    verify(groupsModel.save).calledOnce();
  });

  it("throws an error when it cannot create a new group", async () => {
    groupsModel.save = async () => { throw new Error(thrownErrMsg.groupModelAdd); };
    try {
      await endpoint.create({} as Request);
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err.message).toEqual(thrownErrMsg.groupModelAdd);
    }
    verify(groupsModel.save).calledOnce();
  });

  it("throws an error when it cannot find a group to update", async () => {
    const request = {
      params: {
        id: "1",
      },
    } as any as Request;
    groupsModel.update = async () => { throw new Error(thrownErrMsg.groupModelUpdate); };
    try {
      await endpoint.update(request);
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err.message).toEqual(thrownErrMsg.groupModelUpdate);
    }
    verify(groupsModel.update).calledOnce();
  });

  it("returns a 404 when updating agroup that does not exist", async () => {
    const request = {
      params: {
        id: "1",
      },
    } as any as Request;
    groupsModel.update = async () => null;
    try {
      await endpoint.update(request);
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err.isBoom).toEqual(true);
      expect(err.output.statusCode).toEqual(404);
      expect(err.output.payload.message).toEqual("Group with ID 1 not found");
    }
    verify(groupsModel.update).calledOnce();
  });

  it("Updates a group", async () => {
    const request = {
      params: {
        id: "1",
      },
      payload: {
        name: "test2",
      },
    } as any as Request;
    groupsModel.update = async () => ({
      id: 1,
      name: "test2",
    });
    const result = await endpoint.update(request);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("id", 1);
    expect(result).toHaveProperty("name", "test2");
    verify(groupsModel.update).calledOnce();
  });

  it("returns an empty list when there are no groups", async () => {
    groupsModel.getAll = async () => [];
    const result = await endpoint.list({} as Request);
    expect(result.length).toEqual(0);
    verify(groupsModel.getAll).calledOnce();
  });

  it("returns a list of groups", async () => {
    groupsModel.getAll = async () => [
      {id: 1, name: "test1"},
      {id: 2, name: "test2"},
      {id: 3, name: "test3"},
    ];
    const result = await endpoint.list({} as Request);
    expect(result.length).toEqual(3);
    result.forEach((group) => {
      expect(group).toHaveProperty("id");
      expect(group).toHaveProperty("name");
    });
    verify(groupsModel.getAll).calledOnce();
  });

  it("returns a single group", async () => {
    const request = {
      params: {
        id: "1",
      },
    } as any as Request;
    groupsModel.get = async () => ({id: 1, name: "test1"});
    const result = await endpoint.get(request);
    expect(result).toHaveProperty("id", 1);
    expect(result).toHaveProperty("name", "test1");
  });

  it("returns a 404 when the requested group is not found for get", async () => {
    const request = {
      params: {
        id: "1",
      },
    } as any as Request;
    groupsModel.get = async () => null;

    try {
      await endpoint.get(request);
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err.isBoom).toEqual(true);
      expect(err.output.statusCode).toEqual(404);
      expect(err.output.payload.message).toEqual("Group with ID 1 not found");
    }
  });

  it("returns a 404 when the requested group is not found for delete", async () => {
    const request = {
      params: {
        id: "1",
      },
    } as any as Request;
    groupsModel.delete = async () => null;

    try {
      await endpoint.delete(request);
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err.isBoom).toEqual(true);
      expect(err.output.statusCode).toEqual(404);
      expect(err.output.payload.message).toEqual("Group with ID 1 not found");
    }

    verify(groupsModel.delete).calledOnce();
  });

  it("deletes the group", async () => {
    const request = {
      params: {
        id: "1",
      },
    } as any as Request;
    groupsModel.delete = async () => ({id: 1, name: "test1"});

    const result = await endpoint.delete(request);
    expect(result).toContain("Successfully");
    verify(groupsModel.delete).calledOnce();
  });

});
