import * as Boom from "boom";
import { Request, ServerRoute } from "hapi";
import * as Joi from "joi";
import { orElseThrow } from "nullable-ts";
import { EndpointController } from "../models/endpoint-controller";
import { RssFeed, RssFeedApiResponse, RssFeedBase, RssModel } from "../models/rss";
import { thrownErrMsg, transformErrors } from "../utils/errors";

const joiRssFeedBasePayload = {
  title: Joi.string().required(),
  url: Joi.string().uri().required(),
};

const joiRssFeedPayload = {
...joiRssFeedBasePayload,
id: Joi.number().integer().min(1).required(),
};

export const joiRssFeedApiResponse = {
  ...joiRssFeedPayload,
  added_on: Joi.number().required(),
  last_updated: Joi.number().required(),
};

export class FeedsController extends EndpointController {

  constructor(private rss: RssModel) {
    super();
    this.getFeeds = this.getFeeds.bind(this);
    this.saveFeed = this.saveFeed.bind(this);
    this.updateFeed = this.updateFeed.bind(this);
  }

  public async getFeeds(): Promise<RssFeedApiResponse[]> {
    const feeds = await this.rss.getFeeds();
    return feeds.map(RssModel.rssFeedToApiResponse);
  }

  public async saveFeed(request: Request): Promise<RssFeedApiResponse> {
    const feedPayload = request.payload as RssFeedBase;
    const feedNullable = await this.rss.saveFeed(feedPayload);
    const feed = orElseThrow(feedNullable, Boom.internal(thrownErrMsg.feedsSaveError));
    return RssModel.rssFeedToApiResponse(feed);
  }

  public async updateFeed(request: Request): Promise<RssFeedApiResponse> {
    const feedPayload = request.payload as RssFeed;
    const feedNullable = await this.rss.updateFeed(feedPayload);
    const feed = orElseThrow(feedNullable,
      Boom.notFound(transformErrors(thrownErrMsg.feedsNotFound, {id: feedPayload.id.toString()})));

    return RssModel.rssFeedToApiResponse(feed);
  }

  public registerRoutes(): ServerRoute[] {
    return [
      {
        method: "GET",
        options: {
          handler: this.getFeeds,
          response: {
            schema: Joi.array().items(joiRssFeedApiResponse),
          },
        },
        path: "/api/v1/feed",
      },
      {
        method: "POST",
        options: {
          handler: this.saveFeed,
          response: {
            schema: joiRssFeedApiResponse,
          },
          validate: {
            payload: joiRssFeedBasePayload,
          },
        },
        path: "/api/v1/feed",
      },
      {
        method: "PUT",
        options: {
          handler: this.updateFeed,
          response: {
            schema: joiRssFeedApiResponse,
          },
          validate: {
            payload: joiRssFeedPayload,
          },
        },
        path: "/api/v1/feed",
      },
    ];
  }
}
