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
      rssModel.getFeed = async () => null;
      try {
        await model.addFeedToGroup(1, 1);
        expect(true).toEqual(false);
      } catch (err) {
        expect(err.message).toEqual("Feed with id=1 not found");
      }
      verify(groupDao.addFeedToGroup).notCalled();
      verify(groupDao.getGroupsForFeed).notCalled();
    });

    it("throws an error when a group id cannot be found", async () => {
      rssModel.getFeed = async () => ({} as RssFeed);
      groupModel.get = async () => null;
      try {
        await model.addFeedToGroup(1, 1);
        expect(true).toEqual(false);
      } catch (err) {
        expect(err.message).toEqual("Group with id=1 not found");
      }
      verify(groupDao.addFeedToGroup).notCalled();
      verify(groupDao.getGroupsForFeed).notCalled();
    });

    it("adds a feed to a group, and returns correctly", async () => {
      rssModel.getFeed = async () => ({} as RssFeed);
      groupModel.get = async () => ({} as Group);
      const result = await model.addFeedToGroup(1, 2);
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
});
