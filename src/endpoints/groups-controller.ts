import * as Boom from "boom";
import { Request, ServerRoute } from "hapi";
import * as Joi from "joi";
import { orElseThrow } from "nullable-ts";
import { EndpointController } from "../models/endpoint-controller";
import { GroupApiResponse, GroupBase, GroupModel } from "../models/group";
import { thrownErrMsg, transformErrors } from "../utils/errors";
import { logger } from "../utils/logger";

export const joiGroupResponse = {
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
    const groupNullable = await this.groupModel.update(groupId, groupPayload);
    const group = orElseThrow(groupNullable,
      Boom.notFound(transformErrors(thrownErrMsg.groupNotFound, {id: groupId.toString()})));
    return GroupModel.groupToApiResponse(group);
  }

  public async list(request: Request): Promise<GroupApiResponse[]> {
    const groups = await this.groupModel.getAll();
    return groups.map((group) => GroupModel.groupToApiResponse(group));
  }

  public async get(request: Request): Promise<GroupApiResponse> {
    const groupId = parseInt(request.params.id, 10);
    const groupNullable = await this.groupModel.get(groupId);
    const group = orElseThrow(groupNullable,
      Boom.notFound(transformErrors(thrownErrMsg.groupNotFound, {id: groupId.toString()})));
    return GroupModel.groupToApiResponse(group);
  }

  public async delete(request: Request): Promise<string> {
    const groupId = parseInt(request.params.id, 10);
    const groupNullable = await this.groupModel.delete(groupId);
    const group = orElseThrow(groupNullable,
      Boom.notFound(transformErrors(thrownErrMsg.groupNotFound, {id: groupId.toString()})));
    return `Successfully deleted group ${group.name}`;
  }

  public registerRoutes(): ServerRoute[] {
    return [
      {
        method: "POST",
        options: {
          handler: this.create,
          response: {
            schema: joiGroupResponse,
          },
          validate: {
            payload: joiGroupCreatePayload,
          },
        },
        path: "/api/v1/group",
      },
      {
        method: "PUT",
        options: {
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
        path: "/api/v1/group/{id}",
      },
      {
        method: "GET",
        options: {
          handler: this.list,
          response: {
            schema: Joi.array().items(joiGroupResponse),
          },
        },
        path: "/api/v1/group",
      },
      {
        method: "GET",
        options: {
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
        path: "/api/v1/group/{id}",
      },
      {
        method: "DELETE",
        options: {
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
        path: "/api/v1/group/{id}",
      },
    ];
  }
}
