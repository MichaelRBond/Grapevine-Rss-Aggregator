import { isNullOrUndefined } from "util";

export type Nullable<T> = T | null;

export function orElseThrow<T>(value: Nullable<T>, err: Error): T {
  if (isNullOrUndefined(value)) {
    throw err;
  }
  return value;
}
