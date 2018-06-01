import * as Boom from "boom";
import { Request, ServerRoute } from "hapi";
import * as Joi from "joi";
import { EndpointController } from "../models/endpoint-controller";
import { FeedGroupsApiResponse, GroupFeedsApiResponse, FeedGroupAddPayload, FeedGroupModel } from "../models/feed-group";
import { GroupModel } from "../models/group";
import { Rss } from "../models/rss";
import { thrownErrMsg, transformErrors } from "../utils/errors";
import { joiGroupResponse } from "./groups-controller";
import { RssFeedDao } from "../dao/rss-feed";
import { isNullOrUndefined, isNull } from "util";

const joiFeedGroupsResponse = {
  feed: {
    id: Joi.number().integer().min(1).required(),
    title: Joi.string().required(),
  },
  groups: Joi.array().items(joiGroupResponse),
};

const joiAddGroupToFeedPayload = {
  feed_id: Joi.number().integer().min(1),
  group_id: Joi.number().integer().min(1),
};

export class GroupFeedController extends EndpointController {
  constructor(
    private groupModel: GroupModel,
    private feedDao: RssFeedDao,
    private feedGroupModel: FeedGroupModel,
  ) {
    super();
  }

  public async addGroupToFeed(request: Request): Promise<FeedGroupsApiResponse> {
    const addPayload = request.payload as FeedGroupAddPayload;
    const feedId = addPayload.feedId;
    const groupId = addPayload.groupId;

    const feed = this.feedDao.getById(feedId);
    if (isNull(feed)) {
      throw Boom.notFound(transformErrors(thrownErrMsg.feedsNotFound, {id: feedId.toString()}));
    }

    const group = this.groupModel.get(groupId);
    if (isNull(group)) {
      throw Boom.notFound(transformErrors(thrownErrMsg.groupNotFound, {id: groupId.toString()}));
    }

    await this.feedGroupModel
  }

  public async removeGroupFromFeed(): Promise<FeedGroupsApiResponse> {

  }

  public async retrieveFeedGroups(): Promise<FeedGroupsApiResponse> {

  }

  public async retrieveGroupFeeds(): Promise<GroupFeedsApiResponse> {

  }

  public registerRoutes(): ServerRoute[] {
    return [
      {
        config: {
          handler: this.addGroupToFeed,
          response: {
            schema: joiFeedGroupsResponse,
          },
          validate: {
            params: {
              feedId: Joi.number().min(1),
            },
            payload: joiAddGroupToFeedPayload,
          },
        },
        method: "POST",
        path: "/api/v1/feed-group/add",
      },
    ];
  }
}
