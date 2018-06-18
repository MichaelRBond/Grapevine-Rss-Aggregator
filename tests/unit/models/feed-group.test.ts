import { GroupDao } from "../../../src/dao/group";
import { RssFeed } from "../../../src/model/rss";
import { FeedGroupModel } from "../../../src/models/feed-group";
import { Group, GroupModel } from "../../../src/models/group";
import { Rss } from "../../../src/models/rss";
import { Mock, mock, verify } from "../../utils/mockfill";

describe("Unit: feed-group", () => {
  let rssModel: Mock<Rss>;
  let groupModel: Mock<GroupModel>;
  let groupDao: Mock<GroupDao>;
  let model: FeedGroupModel;

  beforeEach(() => {
    rssModel = mock<Rss>();
    groupModel = mock<GroupModel>();
    groupDao = mock<GroupDao>();

    model = new FeedGroupModel(rssModel, groupModel, groupDao);
  });

  describe("addFeedToGroup", () => {
    it("throws an error when a feed id cannot be found", async () => {
      await expectFeedIdNotFound();
      verify(groupDao.addFeedToGroup).notCalled();
      verify(groupDao.getGroupsForFeed).notCalled();
    });

    it("throws an error when a group id cannot be found", async () => {
      expectGroupIdNotFound();
      verify(groupDao.addFeedToGroup).notCalled();
      verify(groupDao.getGroupsForFeed).notCalled();
    });

    it("adds a feed to a group, and returns correctly", async () => {
      rssModel.getFeed = async () => ({} as RssFeed);
      groupModel.get = async () => ({} as Group);
      groupDao.getGroupsForFeed = async () => [];

      const result = await model.addFeedToGroup(1, 2);
      expect(result.length).toEqual(0);

      verify(groupDao.addFeedToGroup).calledWithArgsLike(([feedId, groupId]) => {
        expect(feedId).toEqual(1);
        expect(groupId).toEqual(2);
        return true;
      });
      verify(groupDao.getGroupsForFeed).calledWithArgsLike(([id]) => {
        expect(id).toEqual(1);
        return true;
      });
    });
  });

  describe("removeFeedFromGroup", () => {
    it("throws an error if the feed does not exist", async () => {
      await expectFeedIdNotFound();
      verify(groupDao.removeFeedFromGroup).notCalled();
      verify(groupDao.getGroupsForFeed).notCalled();
    });

    it("throws an error if the group doesn't exist", async () => {
      expectGroupIdNotFound();
      verify(groupDao.removeFeedFromGroup).notCalled();
      verify(groupDao.getGroupsForFeed).notCalled();
    });

    it("removes a feed from a group", async () => {
      rssModel.getFeed = async () => ({} as RssFeed);
      groupModel.get = async () => ({} as Group);
      groupDao.getGroupsForFeed = async () => [];

      const result = await model.removeFeedFromGroup(1, 2);
      expect(result.length).toEqual(0);

      verify(groupDao.removeFeedFromGroup).calledWithArgsLike(([feedId, groupId]) => {
        expect(feedId).toEqual(1);
        expect(groupId).toEqual(2);
        return true;
      });
      verify(groupDao.getGroupsForFeed).calledWithArgsLike(([feedId]) => {
        expect(feedId).toEqual(1);
        return true;
      });
    });
  });

  describe("getGroupsForFeed", () => {
    it("throws an error if the feed doesn't exist", async () => {
      rssModel.getFeed = async () => null;
      try {
        await model.getGroupsForFeed(1);
        expect(true).toEqual(false);
      } catch (err) {
        expect(err.message).toEqual(`Feed with id=1 not found`);
      }

      verify(groupDao.getGroupsForFeed).notCalled();
    });

    it("retrieves groups that a feed belongs too", async () => {
      rssModel.getFeed = async () => ({} as RssFeed);
      groupDao.getGroupsForFeed = async () => [];
      const result = await model.getGroupsForFeed(1);
      expect(result.length).toEqual(0);
      verify(groupDao.getGroupsForFeed).calledWithArgsLike(([feedId]) => {
        expect(feedId).toEqual(1);
        return true;
      });
    });
  });

  async function expectFeedIdNotFound() {
    rssModel.getFeed = async () => null;
    try {
      await model.addFeedToGroup(1, 1);
      expect(true).toEqual(false);
    } catch (err) {
      expect(err.message).toEqual("Feed with id=1 not found");
    }
  }

  async function expectGroupIdNotFound() {
    rssModel.getFeed = async () => ({} as RssFeed);
    groupModel.get = async () => null;
    try {
      await model.addFeedToGroup(1, 1);
      expect(true).toEqual(false);
    } catch (err) {
      expect(err.message).toEqual("Group with id=1 not found");
    }
  }
});
