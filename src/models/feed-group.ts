import { GroupDao } from "../dao/group";
import { RssFeedDao } from "../dao/rss-feed";
import { Group, GroupApiResponse, GroupModel } from "./group";
import { orElseThrow } from "./nullable";
import { RssFeed, RssFeedApiResponse, RssModel } from "./rss";

export interface FeedGroupAddPayload {
  feed_id: number;
  group_id: number;
}

export interface FeedsApiResponse {
  feeds: RssFeedApiResponse[];
}

export interface GroupsApiResponse {
  groups: GroupApiResponse[];
}

export interface GroupFeedsApiResponse {
  group: GroupApiResponse;
  feeds: RssFeedApiResponse[];
}

export class FeedGroupModel {
  constructor(
    private feedDao: RssFeedDao,
    private feedModel: RssModel,
    private groupModel: GroupModel,
    private groupDao: GroupDao,
  ) { /* */ }

  public async addFeedToGroup(feedId: number, groupId: number): Promise<Group[]> {
    const feedNullable = await this.feedModel.getFeed(feedId);
    orElseThrow(feedNullable, new Error(`Feed with id=${feedId} not found`));

    const groupNullable = await this.groupModel.get(groupId);
    orElseThrow(groupNullable, new Error(`Group with id=${groupId} not found`));

    await this.groupDao.addFeedToGroup(feedId, groupId);
    return await this.groupDao.getGroupsForFeed(feedId);
  }

  public async removeFeedFromGroup(feedId: number, groupId: number): Promise<Group[]> {
    const feedNullable = await this.feedModel.getFeed(feedId);
    orElseThrow(feedNullable, new Error(`Feed with id=${feedId} not found`));

    const groupNullable = await this.groupModel.get(groupId);
    orElseThrow(groupNullable, new Error(`Group with id=${groupId} not found`));

    await this.groupDao.removeFeedFromGroup(feedId, groupId);
    return await this.groupDao.getGroupsForFeed(feedId);
  }

  public async getGroupsForFeed(feedId: number): Promise<Group[]> {
    const feedNullable = await this.feedModel.getFeed(feedId);
    orElseThrow(feedNullable, new Error(`Feed with id=${feedId} not found`));
    return await this.groupDao.getGroupsForFeed(feedId);
  }

  public async getFeedsForGroup(groupId: number): Promise<RssFeed[]> {
    const groupNullable = await this.groupModel.get(groupId);
    orElseThrow(groupNullable, new Error(`Group with id=${groupId} not found`));
    return await this.feedDao.getFeedsForGroup(groupId);
  }

}
