import * as Boom from "boom";
import { Request, ServerRoute } from "hapi";
import * as Joi from "joi";
import { EndpointController } from "../models/endpoint-controller";
import { FeedGroupAddPayload, FeedGroupModel, GroupsApiResponse } from "../models/feed-group";
import { Group, GroupModel } from "../models/group";
import { thrownErrMsg, transformErrors } from "../utils/errors";
import { joiGroupResponse } from "./groups-controller";

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
    private feedGroupModel: FeedGroupModel,
  ) {
    super();
  }

  public async addGroupToFeed(request: Request): Promise<GroupsApiResponse> {
    const addPayload = request.payload as FeedGroupAddPayload;
    const feedId = addPayload.feedId;
    const groupId = addPayload.groupId;

    let groups: Group[];
    try {
      groups = await this.feedGroupModel.addFeedToGroup(feedId, groupId);
    } catch (err) {
      this.throwMissingError(err.message, feedId, groupId);
    }

    return {
      groups: groups!.map(GroupModel.groupToApiResponse),
    };
  }

  public async removeGroupFromFeed(request: Request): Promise<GroupsApiResponse> {
    const addPayload = request.payload as FeedGroupAddPayload;
    const feedId = addPayload.feedId;
    const groupId = addPayload.groupId;

    let groups: Group[];
    try {
      groups = await this.feedGroupModel.removeFeedFromGroup(feedId, groupId);
    } catch (err) {
      this.throwMissingError(err.message, feedId, groupId);
    }

    return {
      groups: groups!.map(GroupModel.groupToApiResponse),
    };
  }

  // public async retrieveFeedGroups(): Promise<FeedGroupsApiResponse> {

  // }

  // public async retrieveGroupFeeds(): Promise<GroupFeedsApiResponse> {

  // }

  public registerRoutes(): ServerRoute[] {
    return [
      {
        config: {
          handler: this.addGroupToFeed,
          response: {
            schema: joiFeedGroupsResponse,
          },
          validate: {
            payload: joiAddGroupToFeedPayload,
          },
        },
        method: "POST",
        path: "/api/v1/feed-group",
      },
      {
        config: {
          handler: this.removeGroupFromFeed,
          response: {
            schema: joiFeedGroupsResponse,
          },
          validate: {
            payload: joiAddGroupToFeedPayload,
          },
        },
        method: "DELETE",
        path: "/api/v1/feed-group",
      },
    ];
  }

  private throwMissingError(msg: string, feedId: number, groupId: number): void {
    const error = msg.indexOf("Feed") !== -1 ? thrownErrMsg.feedsNotFound : thrownErrMsg.groupNotFound;
    const missingId = msg.indexOf("Feed") !== -1 ? feedId.toString() : groupId.toString();
    throw Boom.notFound(transformErrors(error, {id: missingId}));
  }
}
