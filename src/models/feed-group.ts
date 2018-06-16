import { GroupDao } from "../dao/group";
import { Group, GroupApiResponse, GroupModel } from "./group";
import { orElseThrow } from "./nullable";
import { Rss, RssFeedApiResponse } from "./rss";

export interface FeedGroupAddPayload {
  feedId: number;
  groupId: number;
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
    private feedModel: Rss,
    private groupModel: GroupModel,
    private groupDao: GroupDao,
  ) { /* */ }

  public async addFeedToGroup(feedId: number, groupId: number): Promise<Group[]> {
    const feedNullable = this.feedModel.getFeed(feedId);
    orElseThrow(feedNullable, new Error(`Feed with id=${feedId} not found`));

    const groupNullable = this.groupModel.get(groupId);
    orElseThrow(groupNullable, new Error(`Group with id=${groupId} not found`));

    await this.groupDao.addFeedToGroup(feedId, groupId);
    return await this.groupDao.getGroupsForFeed(feedId);
  }

}
