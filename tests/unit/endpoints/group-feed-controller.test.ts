import { Request } from "hapi";
import { GroupFeedController } from "../../../src/endpoints/group-feed-controller";
import { FeedGroupModel } from "../../../src/models/feed-group";
import { Mock, mock } from "../../utils/mockfill";

describe("Unit: group-feed-controller", () => {

  let model: Mock<FeedGroupModel>;
  let controller: GroupFeedController;

  let req: Request;

  beforeEach(() => {
    model = mock<FeedGroupModel>();
    controller = new GroupFeedController(model);

    req = {
      payload: {
        feedId: 1,
        groupId: 1,
      },
    } as Request;
  });

  describe("addGroupToFeed", () => {
    it("throws an error if the feed cannot be found", async () => {
      model.addFeedToGroup = async () => { throw new Error("Feed with id=1 not found"); };
      try {
        await controller.addGroupToFeed(req);
        expect(true).toEqual(false);
      } catch (err) {
        expect(err.message).toContain("Feed with ID 1 not found");
      }
    });

    it("throws an error if the group cannot be found", async () => {
      model.addFeedToGroup = async () => { throw new Error("Group with id=1 not found"); };
      try {
        await controller.addGroupToFeed(req);
        expect(true).toEqual(false);
      } catch (err) {
        expect(err.message).toContain("Group with ID 1 not found");
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
        expect(true).toEqual(false);
      } catch (err) {
        expect(err.message).toContain("Feed with ID 1 not found");
      }
    });

    it("throws an error if the group cannot be found", async () => {
      model.removeFeedFromGroup = async () => { throw new Error("Group with id=1 not found"); };
      try {
        await controller.removeGroupFromFeed(req);
        expect(true).toEqual(false);
      } catch (err) {
        expect(err.message).toContain("Group with ID 1 not found");
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
    });
  });

  describe("retrieceFeedGroups", () => {
    it("throws an error if the feed doesn't exist", async () => {
      /* */
    });

    it("returns groups for a feed", async () => {
      /* */
    });
  });

  describe("getRoutes", () => {
    it("has routes defined", () => {
      const routes = controller.registerRoutes();
      expect(routes.length).toBeGreaterThan(0);
    });
  });
});
