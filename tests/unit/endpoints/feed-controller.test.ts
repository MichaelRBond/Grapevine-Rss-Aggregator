import { Request } from "hapi";
import { FeedsController } from "../../../src/endpoints/feed-controller";
import { Rss, RssFeed } from "../../../src/models/rss";
import { thrownErrMsg, transformErrors } from "../../../src/utils/errors";
import { Mock, mock, verify } from "../../utils/mockfill";

describe("Unit: feed-controller", () => {

  let rss: Mock<Rss>;
  let api: FeedsController;

  let request: Request;

  beforeEach(() => {
    rss = mock<Rss>();

    api = new FeedsController(rss);

    request = {
      payload: {
        id: undefined,
        title: "test",
        url: "http://test.com",
      } as any,
    } as Request;
  });

  describe("getFeeds()", () => {
    it("returns an empty array when there are no feeds", async () => {
      rss.getFeeds = async () => [];
      const feeds = await api.getFeeds();
      expect(feeds.length).toEqual(0);
      verify(rss.getFeeds).calledOnce();
    });

    it("returns an array of RssFeeds", async () => {
      rss.getFeeds = async () => [{} as RssFeed, {} as RssFeed];
      const feeds = await api.getFeeds();
      expect(feeds.length).toEqual(2);
      verify(rss.getFeeds).calledOnce();
    });
  });

  describe("saveFeed()", () => {
    it("saves a feed to the database and returns an RssFeed", async () => {
      rss.saveFeed = async () => ({
        addedOn: 0,
        id: 1,
        lastUpdated: 0,
        title: "test",
        url: "http://test.com",
      } as RssFeed);

      const result = await api.saveFeed(request);

      expect(result).toHaveProperty("added_on", 0);
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("last_updated", 0);
      expect(result).toHaveProperty("title", "test");
      expect(result).toHaveProperty("url", "http://test.com");

      // verify(rss.save).calledOnce();
    });

    it("throws an error when it cannot save a feed", async () => {
      rss.saveFeed = async () => null;
      try {
        await api.saveFeed(request);
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err.message).toEqual(thrownErrMsg.feedsSaveError);
      }

      // verify(rss.save).calledOnce();
    });

    it("updates a feed in the database, and returns a RssFeed", async () => {
      rss.saveFeed = async () => ({
        addedOn: 0,
        id: 1,
        lastUpdated: 0,
        title: "test",
        url: "http://test.com",
      } as RssFeed);

      const result = await api.saveFeed(request);

      expect(result).toHaveProperty("added_on", 0);
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("last_updated", 0);
      expect(result).toHaveProperty("title", "test");
      expect(result).toHaveProperty("url", "http://test.com");
    });
  });

  describe("updateFeed()", () => {
    it("throws an error when the requested feed cannot be found", async () => {
      request = {
        payload: {
          id: "1",
          title: "test",
          url: "http://test.com",
        } as any,
      } as Request;
      rss.updateFeed = async () => null;
      try {
        await api.updateFeed(request);
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err.message).toContain(transformErrors(thrownErrMsg.feedsNotFound, {id: "1"}));
      }

      verify(rss.updateFeed).calledOnce();
    });

    it("returns a feed", async () => {
      request = {
        payload: {
          id: "1",
          title: "test",
          url: "http://test.com",
        } as any,
      } as Request;

      rss.updateFeed = async () => ({
        addedOn: 0,
        id: 1,
        lastUpdated: 0,
        title: "test",
        url: "http://test.com",
      } as RssFeed);

      const result = await api.updateFeed(request);

      expect(result).toHaveProperty("added_on", 0);
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("last_updated", 0);
      expect(result).toHaveProperty("title", "test");
      expect(result).toHaveProperty("url", "http://test.com");

      verify(rss.updateFeed).calledOnce();
    });

  });

  it("returns an array of routes", () => {
    const routes = api.registerRoutes();
    expect(routes.length).toEqual(3);
  });
});
