import { isNullOrUndefined, Nullable, orElseThrow } from "nullable-ts";
import { GroupDao } from "../dao/group";
import { thrownErrMsg } from "../utils/errors";

export interface GroupApiResponse {
  id: number;
  name: string;
}

export interface GroupBase {
  name: string;
}

export interface Group extends GroupBase {
  id: number;
}

export class GroupModel {
  constructor(private groupDao: GroupDao) {}

  public static groupToApiResponse(group: Group): GroupApiResponse {
    return {
      id: group.id,
      name: group.name,
    };
  }

  public async save(groupBase: GroupBase): Promise<Group> {
    const groupNullable = await this.groupDao.save(groupBase);
    return orElseThrow(groupNullable, new Error(thrownErrMsg.groupModelAdd));
  }

  public async update(id: number, groupBase: GroupBase): Promise<Nullable<Group>> {
    if (isNullOrUndefined(await this.groupDao.getById(id))) {
      return null;
    }
    const groupNullable = await this.groupDao.update(id, groupBase);
    return orElseThrow(groupNullable, new Error(thrownErrMsg.groupModelUpdate));
  }

  public async get(id: number): Promise<Nullable<Group>> {
    return this.groupDao.getById(id);
  }

  public async getAll(): Promise<Group[]> {
    return this.groupDao.get();
  }

  public async delete(id: number): Promise<Nullable<Group>> {
    const group = await this.groupDao.getById(id);
    if (isNullOrUndefined(group)) {
      return null;
    }
    await this.groupDao.delete(id);
    return group;
  }

}
