import * as Boom from "boom";
import { Request, ServerRoute } from "hapi";
import * as Joi from "joi";
import { EndpointController } from "../models/endpoint-controller";
import { FeedGroupAddPayload, FeedGroupModel, FeedsApiResponse, GroupsApiResponse } from "../models/feed-group";
import { Group, GroupModel } from "../models/group";
import { RssFeed, RssModel } from "../models/rss";
import { thrownErrMsg, transformErrors } from "../utils/errors";
import { joiRssFeedApiResponse } from "./feed-controller";
import { joiGroupResponse } from "./groups-controller";

const joiFeedGroupsResponse = {
  groups: Joi.array().items(joiGroupResponse),
};

const joiFeedsResponse = {
  feeds: Joi.array().items(joiRssFeedApiResponse),
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
    this.addGroupToFeed = this.addGroupToFeed.bind(this);
    this.removeGroupFromFeed = this.removeGroupFromFeed.bind(this);
    this.retrieveFeedGroups = this.retrieveFeedGroups.bind(this);
    this.retrieveGroupFeeds = this.retrieveGroupFeeds.bind(this);
  }

  public async addGroupToFeed(request: Request): Promise<GroupsApiResponse> {
    const addPayload = request.payload as FeedGroupAddPayload;
    const feedId = addPayload.feed_id;
    const groupId = addPayload.group_id;

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
    const feedId = addPayload.feed_id;
    const groupId = addPayload.group_id;

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

  public async retrieveFeedGroups(request: Request): Promise<GroupsApiResponse> {
    const feedId = parseInt(request.params.id, 10);

    let groups: Group[];
    try {
      groups = await this.feedGroupModel.getGroupsForFeed(feedId);
    } catch (err) {
      this.throwMissingError(err.message, feedId, 0);
    }

    return {
      groups: groups!.map(GroupModel.groupToApiResponse),
    };
  }

  public async retrieveGroupFeeds(request: Request): Promise<FeedsApiResponse> {
    const groupId = parseInt(request.params.id, 10);

    let feeds: RssFeed[];
    try {
      feeds = await this.feedGroupModel.getFeedsForGroup(groupId);
    } catch (err) {
      this.throwMissingError(err.message, 0, groupId);
    }

    return {
      feeds: feeds!.map(RssModel.rssFeedToApiResponse),
    };
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
      {
        config: {
          handler: this.retrieveFeedGroups,
          response: {
            schema: joiFeedGroupsResponse,
          },
          validate: {
            params: {
              id: Joi.number().min(1),
            },
          },
        },
        method: "GET",
        path: "/api/v1/feed/{id}/groups",
      },
      {
        config: {
          handler: this.retrieveGroupFeeds,
          response: {
            schema: joiFeedsResponse,
          },
          validate: {
            params: {
              id: Joi.number().min(1),
            },
          },
        },
        method: "GET",
        path: "/api/v1/group/{id}/feeds",
      },
    ];
  }

  private throwMissingError(msg: string, feedId: number, groupId: number): void {
    const error = msg.indexOf("Feed") !== -1 ? thrownErrMsg.feedsNotFound : thrownErrMsg.groupNotFound;
    const missingId = msg.indexOf("Feed") !== -1 ? feedId.toString() : groupId.toString();
    throw Boom.notFound(transformErrors(error, {id: missingId}));
  }
}
