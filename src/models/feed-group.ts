import { MySqlClient } from "../clients/mysql-client";
import { GroupApiResponse } from "./group";
import { RssFeedApiResponse } from "./rss";

export interface FeedGroupAddPayload {
  feedId: number;
  groupId: number;
}

export interface FeedGroupsApiResponse {
  feed: RssFeedApiResponse;
  groups: GroupApiResponse[];
}

export interface GroupFeedsApiResponse {
  group: GroupApiResponse;
  feeds: RssFeedApiResponse[];
}

export class FeedGroupModel {
  constructor(
    private mysqlProvider: () => MySqlClient,
  ) { /* */ }

  public async addGroupToFeed(feedId: number, groupId: number): Promise<any> {
    const mysql = this.mysqlProvider();
    const sql = "INSERT INTO "
    return;
  }
}
