export enum thrownErrMsg {
  dbDelete = "Error deleting group. Affected rows=:affectedRows:",
  feedsNotFound = "Feed with ID :id: not found",
  feedsSaveError = "Error saving feed",
  feedsInvalidId = "Feed ID must be an integer",
  groupModelAdd = "Unable to save group",
  groupModelUpdate = "Unable to update group",
  groupNotFound = "Group with ID :id: not found",
  testing = "This is a :adjective: :noun:. It is for testing :adjective: tests",
}

export function transformErrors(error: thrownErrMsg, replacements: {[s: string]: string}): string {
  let ret = error as string;
  for (const key of Object.keys(replacements)) {
    const re = new RegExp(`:${key}:`, "g");
    ret = ret.replace(re, replacements[key]);
  }
  return ret;
}
