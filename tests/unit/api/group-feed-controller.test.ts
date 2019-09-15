import { Request } from "hapi";
import { GroupFeedController } from "../../../src/api/group-feed-controller";
import { FeedGroupModel } from "../../../src/models/feed-group";
import { Mock, mock, verify } from "../../utils/mockfill";

describe("Unit: group-feed-controller", () => {

  let model: Mock<FeedGroupModel>;
  let controller: GroupFeedController;

  let req: Request;

  beforeEach(() => {
    model = mock<FeedGroupModel>();
    controller = new GroupFeedController(model);

    req = {
      payload: {
        feed_id: 1,
        group_id: 2,
      },
    } as Request;
  });

  describe("addGroupToFeed", () => {
    it("throws an error if the feed cannot be found", async () => {
      model.addFeedToGroup = async () => { throw new Error("Feed with id=1 not found"); };
      try {
        await controller.addGroupToFeed(req);
        fail();
      } catch (err) {
        expect(err.message).toContain("Feed with ID 1 not found");
      }
    });

    it("throws an error if the group cannot be found", async () => {
      model.addFeedToGroup = async () => { throw new Error("Group with id=1 not found"); };
      try {
        await controller.addGroupToFeed(req);
        fail();
      } catch (err) {
        expect(err.message).toContain("Group with ID 2 not found");
      }
    });

    it("returns an array of groups when saving a group to a feed", async () => {
      model.addFeedToGroup = async () => [
        { id: 1, name: "group1"},
        { id: 2, name: "group2"},
      ];
      const result = await controller.addGroupToFeed(req);
      let count = 1;
      result.groups.forEach((g) => {
        expect(g).toHaveProperty("id", count);
        expect(g).toHaveProperty("name", `group${count++}`);
      });
    });
  });

  describe("removeGroupFromFeed", () => {
    it("throws an error if the feed cannot be found", async () => {
      model.removeFeedFromGroup = async () => { throw new Error("Feed with id=1 not found"); };
      try {
        await controller.removeGroupFromFeed(req);
        fail();
      } catch (err) {
        expect(err.message).toContain("Feed with ID 1 not found");
      }
    });

    it("throws an error if the group cannot be found", async () => {
      model.removeFeedFromGroup = async () => { throw new Error("Group with id=1 not found"); };
      try {
        await controller.removeGroupFromFeed(req);
        fail();
      } catch (err) {
        expect(err.message).toContain("Group with ID 2 not found");
      }
    });

    it("returns an array of groups after removing a feed from a group", async () => {
      model.removeFeedFromGroup = async () => [
        { id: 1, name: "group1"},
        { id: 2, name: "group2"},
      ];
      const result = await controller.removeGroupFromFeed(req);
      let count = 1;
      result.groups.forEach((g) => {
        expect(g).toHaveProperty("id", count);
        expect(g).toHaveProperty("name", `group${count++}`);
      });

      verify(model.removeFeedFromGroup).calledWithArgsLike(([feedId, groupId]) => {
        expect(feedId).toEqual(1);
        expect(groupId).toEqual(2);
        return true;
      });
    });
  });

  describe("retrieveFeedGroups", () => {

    beforeEach(() => {
      req = {
        params: {
          id: 1,
        } as any,
      } as Request;
    });

    it("throws an error if the feed doesn't exist", async () => {
      model.getGroupsForFeed = async () => { throw new Error("Feed"); };
      try {
        await controller.retrieveFeedGroups(req);
        fail();
      } catch (err) {
        expect(err.message).toEqual("Feed with ID 1 not found");
      }
    });

    it("returns groups for a feed", async () => {
      model.getGroupsForFeed = async () => [
        {id: 1, name: "group1"},
        {id: 2, name: "group2"},
      ];
      const result = await controller.retrieveFeedGroups(req);
      expect(result.groups.length).toEqual(2);

      let count = 1;
      result.groups.forEach((g) => {
        expect(g).toHaveProperty("id", count);
        expect(g).toHaveProperty("name", `group${count++}`);
      });

      verify(model.getGroupsForFeed).calledWithArgsLike(([id]) => {
        expect(id).toEqual(1);
        return true;
      });
    });
  });

  describe("retrieveGroupFeeds()", () => {
    beforeEach(() => {
      req = {
        params: {
          id: 1,
        } as any,
      } as Request;
    });

    it("throws an error if the group doesn't exist", async () => {
      model.getFeedsForGroup = async () => { throw new Error("Group"); };
      try {
        await controller.retrieveGroupFeeds(req);
        fail();
      } catch (err) {
        expect(err.message).toEqual("Group with ID 1 not found");
      }
    });

    it("returns an array of feeds that belong to a group", async () => {
      model.getFeedsForGroup = async () => [];
      const result = await controller.retrieveGroupFeeds(req);
      expect(result.feeds.length).toEqual(0);
      verify(model.getFeedsForGroup).calledWithArgsLike(([id]) => {
        expect(id).toEqual(1);
        return true;
      });
    });
  });

  describe("getRoutes", () => {
    it("has routes defined", () => {
      const routes = controller.registerRoutes();
      expect(routes.length).toBeGreaterThan(0);
    });
  });
});
