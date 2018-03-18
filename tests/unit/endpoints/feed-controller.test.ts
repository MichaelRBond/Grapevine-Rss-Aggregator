import { Request } from "hapi";
import { FeedsController } from "../../../src/endpoints/feed-controller";
import {Rss, RssFeed} from "../../../src/models/rss";

describe("Unit: feed-controller", () => {

  let rss: Rss;
  let api: FeedsController;

  let request: Request;

  beforeEach(() => {
    rss = {} as Rss; // TODO: Replace with Mock fill

    api = new FeedsController(rss);

    request = {
      payload: {
        title: "test",
        url: "http://test.com",
      } as any,
    } as Request;
  });

  it("returns an empty array when there are no feeds");
  it("returns an array of RssFeeds");

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
      expect(err.message).toContain("Should be 500"); // FIXME:
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

  it("throws an error when the requested feed cannot be found", async () => {
    rss.updateFeed = async () => null;
    try {
      await api.updateFeed(request);
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err.message).toContain("Should be 404"); // FIXME:
    }
  });

  it("returns an array of routes", () => {
    const routes = api.registerRoutes();
    expect(routes.length).toEqual(3);
  });
});
