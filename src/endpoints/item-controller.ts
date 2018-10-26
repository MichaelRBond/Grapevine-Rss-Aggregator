import * as Boom from "boom";
import { Request, ServerRoute } from "hapi";
import * as Joi from "joi";
import { get, isDefined, isNullOrUndefined, Nullable, orElseThrow } from "nullable-ts";
import { EndpointController } from "../models/endpoint-controller";
import { ItemFlags, RssItemApiResponse, RssModel } from "../models/rss";
import { thrownErrMsg, transformErrors } from "../utils/errors";
import { isNotBlank } from "../utils/helpers";

const joiRssItemApiResponse = {
  author: Joi.string().optional().allow(null, ""),
  categories: Joi.array().items(Joi.string().allow(null, "")).optional(),
  comments: Joi.string().optional().allow(null, ""),
  description: Joi.string().optional().allow(null, ""),
  enclosures: Joi.array().items(Joi.string().allow(null, "")).optional(),
  feed_id: Joi.number().min(1).required(),
  guid: Joi.string().required(),
  id: Joi.number().min(1).required(),
  image: Joi.object().optional(),
  link: Joi.string().optional().allow(null, ""),
  published: Joi.date(),
  read: Joi.boolean().required(),
  starred: Joi.boolean().required(),
  summary: Joi.string().optional().allow(null, ""),
  title: Joi.string().optional().allow(null, ""),
  updated: Joi.date(),
};

export class ItemController extends EndpointController {
  constructor(
    private rssModel: RssModel,
  ) {
    super();
    this.getFeedItems = this.getFeedItems.bind(this);
    this.getItems = this.getItems.bind(this);
    this.setStatusOfItem = this.setStatusOfItem.bind(this);
  }

  public async getFeedItems(request: Request): Promise<RssItemApiResponse[]> {
    const feedId = parseInt(request.params.id, 10);
    const feedNullable = await this.rssModel.getFeed(feedId);
    orElseThrow(feedNullable, Boom.notFound(transformErrors(thrownErrMsg.feedsNotFound, {id: feedId.toString()})));

    const flags = this.parseFlags(request.params.flags);
    const read = this.determineReadFlag(flags);
    const starred = this.determineStarredFlag(flags);

    const items = await this.rssModel.getFeedItems(feedId, read, starred);
    return items.map(this.rssModel.rssItemToApiResponse);
  }

  public async getItems(request: Request): Promise<RssItemApiResponse[]> {
    const flags = isDefined(request.params) ? this.parseFlags(request.params.flags) : [];
    const read = this.determineReadFlag(flags);
    const starred = this.determineStarredFlag(flags);
    const items = await this.rssModel.getItems(read, starred);
    return items.map(this.rssModel.rssItemToApiResponse);
  }

  public async setStatusOfItem(request: Request): Promise<{message: string}> {
    const itemId = parseInt(request.params.id, 10);
    const itemNullable = await this.rssModel.getItemById(itemId);
    orElseThrow(itemNullable, Boom.notFound(transformErrors(thrownErrMsg.itemNotFound, {id: itemId.toString()})));

    const payload = request.payload as {flag: ItemFlags};
    try {
      await this.rssModel.setItemStatus(itemId, payload.flag);
    } catch (err) {
      throw Boom.internal(transformErrors(thrownErrMsg.itemStatusUpdateError,
        {id: itemId.toString(), flag: payload.flag}));
    }

    return {message: `Successfully updated id=${itemId} with status=${payload.flag}`};
  }

  // visible for testing
  public determineReadFlag(flags: ItemFlags[]): Nullable<boolean> {
    return this.determineFlagState(ItemFlags.unread, ItemFlags.read, flags);
  }

  // visible for testing
  public determineStarredFlag(flags: ItemFlags[]): Nullable<boolean> {
    return this.determineFlagState(ItemFlags.unstarred, ItemFlags.starred, flags);
  }

  // visible for testing
  public parseFlags(flagsParmasOptional?: string): ItemFlags[] {
    if (isNullOrUndefined(flagsParmasOptional)) {
      return [];
    }
    const flagsParmas = get(flagsParmasOptional as string);
    const flags = flagsParmas.split("/");
    const filteredFlags = flags.filter(isNotBlank);
    const invalidFlags = filteredFlags.filter(this.isInvalidFlag);
    if (invalidFlags.length) {
      throw Boom.badRequest(transformErrors(thrownErrMsg.itemsInvalidFlag, {flag: `${invalidFlags.join(", ")}`}));
    }
    return filteredFlags as ItemFlags[];
  }

  public registerRoutes(): ServerRoute[] {
    return [
      {
        method: "GET",
        options: {
          handler: this.getFeedItems,
          response: {
            schema: Joi.array().items(joiRssItemApiResponse),
          },
          validate: {
            params: {
              flags: Joi.string().optional(),
              id: Joi.number().min(1),
            },
          },
        },
        path: "/api/v1/items/feed/{id}/{flags*}",
      },
      {
        method: "GET",
        options: {
          handler: this.getItems,
          response: {
            schema: Joi.array().items(joiRssItemApiResponse),
          },
          validate: {
            params: {
              flags: Joi.string().optional(),
            },
          },
        },
        path: "/api/v1/items/{flags*}",
      },
      {
        method: "POST",
        options: {
          handler: this.setStatusOfItem,
          response: {
            schema: {message: Joi.string()},
          },
          validate: {
            params: {
              id: Joi.number().min(1).required(),
            },
            payload: {
              flag: Joi.string().only(
                ItemFlags.read,
                ItemFlags.unread,
                ItemFlags.starred,
                ItemFlags.unstarred,
              ),
            },
          },
        },
        path: "/api/v1/item/{id}/status",
      },
    ];
  }

  private isInvalidFlag(flag: string): boolean {
    return isNullOrUndefined(ItemFlags[flag as ItemFlags]);
  }

  private determineFlagState(falseFlag: ItemFlags, trueFlag: ItemFlags, flags: ItemFlags[]): Nullable<boolean> {
    if (flags.some((f) => f === falseFlag)) {
      return false;
    } else if (flags.some((f) => f === trueFlag)) {
      return true;
    }
    return null;
  }
}
