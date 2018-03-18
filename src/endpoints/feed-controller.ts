import { Request, ServerRoute } from "hapi";
import * as Joi from "joi";
import { isNullOrUndefined } from "util";
import { EndpointController } from "../models/endpoint-controller";
import { Rss, RssFeed, RssFeedApiResponse, RssFeedBase } from "../models/rss";

const joiRssFeedBasePayload = {
    title: Joi.string().required(),
    url: Joi.string().uri().required(),
};

const joiRssFeedPayload = {
    id: Joi.number().integer().min(1).required(),
    title: Joi.string().required(),
    url: Joi.string().uri().required(),
};

const joiRssFeedApiResponse = {
    ...joiRssFeedPayload,
    added_on: Joi.number().required(),
    last_updated: Joi.number().required(),
};

export class FeedsController extends EndpointController {

    constructor(private rss: Rss) {
        super();
        this.getFeeds = this.getFeeds.bind(this);
        this.saveFeed = this.saveFeed.bind(this);
        this.updateFeed = this.updateFeed.bind(this);
     }

    public async getFeeds(): Promise<RssFeedApiResponse[]> {
        const feeds = await this.rss.getFeeds();
        return feeds.map(Rss.rssFeedToApiResponse);
    }

    public async saveFeed(request: Request): Promise<RssFeedApiResponse> {
        const feedPayload = request.payload as RssFeedBase;
        const feed = await this.rss.saveFeed(feedPayload);
        if (isNullOrUndefined(feed)) {
            throw new Error("Should be 500");
        }
        return Rss.rssFeedToApiResponse(feed);
    }

    public async updateFeed(request: Request): Promise<RssFeedApiResponse> {
        const feedPayload = request.payload as RssFeed;
        const feed = await this.rss.updateFeed(feedPayload);
        if (isNullOrUndefined(feed)) {
            throw new Error("Should be 404");
        }
        return Rss.rssFeedToApiResponse(feed);
    }

    public registerRoutes(): ServerRoute[] {
        return [
            {
                config: {
                    handler: this.getFeeds,
                    response: {
                        schema: Joi.array().items(joiRssFeedApiResponse),
                    },
                },
                method: "GET",
                path: "/api/v1/feed",
            },
            {
                config: {
                    handler: this.saveFeed,
                    response: {
                        schema: joiRssFeedApiResponse,
                    },
                    validate: {
                        payload: joiRssFeedBasePayload,
                    },
                },
                method: "POST",
                path: "/api/v1/feed",
            },
            {
                config: {
                    handler: this.updateFeed,
                    response: {
                        schema: joiRssFeedApiResponse,
                    },
                    validate: {
                        payload: joiRssFeedPayload,
                    },
                },
                method: "PUT",
                path: "/api/v1/feed",
            },
        ];
    }
}
