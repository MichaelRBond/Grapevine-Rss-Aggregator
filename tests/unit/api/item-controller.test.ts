import { Request } from "hapi";
import { ItemController } from "../../../src/api/item-controller";
import { ItemFlags, RssFeed, RssItem, RssModel } from "../../../src/models/rss";
import { Mock, mock, verify } from "../../utils/mockfill";

describe("Unit: item-controller", () => {
  let rssModel: Mock<RssModel>;
  let controller: ItemController;

  let request: Request;

  beforeEach(() => {
    rssModel = mock<RssModel>();
    controller = new ItemController(rssModel);
  });

  describe("getFeedItems()", () => {

    beforeEach(() => {
      request = {
        params: {
          id: 1,
        } as any,
      } as Request;
    });

    it("Throws an error when the feed doesn't exist", async () => {
      rssModel.getFeed = async () => null;
      try {
        await controller.getFeedItems(request);
      } catch (err) {
        expect(err.message).toEqual("Feed with ID 1 not found");
      }
      verify(rssModel.getFeedItems).notCalled();
    });

    it("returns an array on success", async () => {
      rssModel.getFeed = async () => ({} as RssFeed);
      rssModel.getFeedItems = async () => [{} as RssItem];
      const result = await controller.getFeedItems(request);
      verify(rssModel.getFeed).calledWith(1);
      verify(rssModel.getFeedItems).calledWith(1, null, null);
      verify(rssModel.rssItemToApiResponse).calledOnce();
    });
  });

  describe("getItems()", () => {

    beforeEach(() => {
      request = {
      } as Request;

      rssModel.getItems = async () => [{} as RssItem];
    });

    it("returns an array on success", async () => {
      rssModel.getItems = async () => [{} as RssItem];
      const result = await controller.getItems(request);
      verify(rssModel.getItems).calledWith(null, null);
      verify(rssModel.rssItemToApiResponse).calledOnce();
    });

    it("returns an array when flags are provided", async () => {
      request = {
        params: {
          flags: "starred/read",
        } as any,
      } as Request;
      const result = await controller.getItems(request);
      verify(rssModel.getItems).calledWith(true, true);
      verify(rssModel.rssItemToApiResponse).calledOnce();
    });
  });

  describe("setStatusOfItem()", () => {

    beforeEach(() => {
      request = {
        params: {
          id: 1,
        } as any,
        payload: {
          flag: "unread",
        },
      } as Request;
    });

    it("throws an error if the item id cannot be found", async () => {
      rssModel.getItemById = async () => null;
      try {
        await controller.setStatusOfItem(request);
        fail();
      } catch (err) {
        expect(err.message).toEqual("Item with ID 1 not found");
      }
      verify(rssModel.setItemStatus).notCalled();
    });

    it("throws an error if an invalid flag payload was provided", async () => {
      rssModel.getItemById = async () => ({} as RssItem);
      rssModel.setItemStatus = async () => { throw new Error("Invalid status flag provided"); };
      try {
        await controller.setStatusOfItem(request);
        fail();
      } catch (err) {
        expect(err.message).toEqual("Error updating status=unread on id=1");
      }
      verify(rssModel.setItemStatus).calledWith(1, "unread");
    });

    it("returns correctly if the status could be updated", async () => {
      rssModel.getItemById = async () => ({} as RssItem);
      const result = await controller.setStatusOfItem(request);
      expect(result.message).toEqual("Successfully updated id=1 with status=unread");
    });
  });

  describe("determineReadFlag()", () => {
    it("returns true if read flag is passed in", () => {
      const result = controller.determineReadFlag([ItemFlags.starred, ItemFlags.read]);
      expect(result).toEqual(true);
    });

    it("returns false if unread flag is passed in", () => {
      const result = controller.determineReadFlag([ItemFlags.starred, ItemFlags.unread]);
      expect(result).toEqual(false);
    });

    it("returns false if both unread and read flags are passed in", () => {
      const result = controller.determineReadFlag([ItemFlags.read, ItemFlags.unread]);
      expect(result).toEqual(false);
    });

    it("returns null if neither the read or unread flag are passed in", () => {
      const result = controller.determineReadFlag([ItemFlags.starred, ItemFlags.unstarred]);
      expect(result).toEqual(null);
    });
  });

  describe("determineStarredFlag()", () => {
    it("returns true if starred flag is passed in", () => {
      const result = controller.determineStarredFlag([ItemFlags.read, ItemFlags.starred]);
      expect(result).toEqual(true);
    });

    it("returns false if unstarred flag is passed in", () => {
      const result = controller.determineStarredFlag([ItemFlags.read, ItemFlags.unstarred]);
      expect(result).toEqual(false);
    });

    it("returns false if both unstarred and starred flags are passed in", () => {
      const result = controller.determineStarredFlag([ItemFlags.starred, ItemFlags.unstarred]);
      expect(result).toEqual(false);
    });

    it("returns null if neither the starred or unstarred flag are passed in", () => {
      const result = controller.determineStarredFlag([ItemFlags.read, ItemFlags.unread]);
      expect(result).toEqual(null);
    });
  });

  describe("parseFlags()", () => {
    it("returns an empty array when no arguments are passed in", () => {
      expect(controller.parseFlags().length).toEqual(0);
    });

    it("returns an empty array when flags does not have any items", () => {
      expect(controller.parseFlags("////").length).toEqual(0);
    });

    it("returns a single flag", () => {
      expect(controller.parseFlags("/unread/////").length).toEqual(1);
      expect(controller.parseFlags("///starred////").length).toEqual(1);
    });

    it("returns two flags", () => {
      expect(controller.parseFlags("/unread/starred").length).toEqual(2);
      expect(controller.parseFlags("/starred/unread").length).toEqual(2);
    });

    it("throws an error if an invalid flag is provided", () => {
      try {
        controller.parseFlags("/unread/foo/bar");
      } catch (err) {
        expect(err.message).toEqual("Invalid flag(s): foo, bar");
      }
    });
  });

  describe("registerRoutes()", () => {
    it("returns an array of routes", () => {
      const routes = controller.registerRoutes();
      expect(routes).toHaveLength(3);
    });
  });
});
