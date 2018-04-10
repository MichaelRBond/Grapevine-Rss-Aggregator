import * as Boom from "boom";
import { Request, ServerRoute } from "hapi";
import * as Joi from "joi";
import { isNullOrUndefined } from "util";
import { EndpointController } from "../models/endpoint-controller";
import { GroupApiResponse, GroupBase, GroupModel } from "../models/group";
import { thrownErrMsg, transformErrors } from "../utils/errors";
import { logger } from "../utils/logger";

const joiGroupResponse = {
  id: Joi.number().integer().min(1).required(),
  name: Joi.string().required(),
};

const joiGroupCreatePayload = {
  name: Joi.string().required(),
};

export class GroupsController extends EndpointController {

  constructor(private groupModel: GroupModel) {
    super();
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.list = this.list.bind(this);
    this.get = this.get.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async create(request: Request): Promise<GroupApiResponse> {
    const groupPayload = request.payload as GroupBase;
    logger.info("Saving new group", groupPayload);
    const group = await this.groupModel.save(groupPayload);
    return GroupModel.groupToApiResponse(group);
  }

  public async update(request: Request): Promise<GroupApiResponse> {
    const groupPayload = request.payload as GroupBase;
    const groupId = parseInt(request.params.id, 10);
    logger.info(`Updating group id=${groupId}`, groupPayload);
    const group = await this.groupModel.update(groupId, groupPayload);
    if (isNullOrUndefined(group)) {
      throw Boom.notFound(transformErrors(thrownErrMsg.groupNotFound, {id: groupId.toString()}));
    }
    return GroupModel.groupToApiResponse(group);
  }

  public async list(request: Request): Promise<GroupApiResponse[]> {
    const groups = await this.groupModel.getAll();
    return groups.map((group) => GroupModel.groupToApiResponse(group));
  }

  public async get(request: Request): Promise<GroupApiResponse> {
    const groupId = parseInt(request.params.id, 10);
    const group = await this.groupModel.get(groupId);
    if (isNullOrUndefined(group)) {
      throw Boom.notFound(transformErrors(thrownErrMsg.groupNotFound, {id: groupId.toString()}));
    }
    return GroupModel.groupToApiResponse(group);
  }

  public async delete(request: Request): Promise<string> {
    const groupId = parseInt(request.params.id, 10);
    const group = await this.groupModel.delete(groupId);
    if (isNullOrUndefined(group)) {
      throw Boom.notFound(transformErrors(thrownErrMsg.groupNotFound, {id: groupId.toString()}));
    }
    return `Successfully deleted group ${group.name}`;
  }

  public registerRoutes(): ServerRoute[] {
    return [
      {
        config: {
          handler: this.create,
          response: {
            schema: joiGroupResponse,
          },
          validate: {
            payload: joiGroupCreatePayload,
          },
        },
        method: "POST",
        path: "/api/v1/group",
      },
      {
        config: {
          handler: this.update,
          response: {
            schema: joiGroupResponse,
          },
          validate: {
            params: {
              id: Joi.number().min(1),
            },
            payload: joiGroupCreatePayload,
          },
        },
        method: "PUT",
        path: "/api/v1/group/{id}",
      },
      {
        config: {
          handler: this.list,
          response: {
            schema: Joi.array().items(joiGroupResponse),
          },
        },
        method: "GET",
        path: "/api/v1/group",
      },
      {
        config: {
          handler: this.get,
          response: {
            schema: joiGroupResponse,
          },
          validate: {
            params: {
              id: Joi.number().min(1),
            },
          },
        },
        method: "GET",
        path: "/api/v1/group/{id}",
      },
      {
        config: {
        handler: this.delete,
        response: {
          schema: Joi.string(),
        },
        validate: {
          params: {
            id: Joi.number().min(1),
          },
        },
      },
      method: "DELETE",
      path: "/api/v1/group/{id}",
    },
   ];
  }
}
