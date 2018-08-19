import { isNullOrUndefined } from "nullable-ts";
import { Readable, Stream } from "stream";

export function convertStringToStream(str: string): Stream {
  const stream = new Readable();
  stream.push(str);   // the string you want
  stream.push(null);
  return stream;
}

export function isBlank(str: string): boolean {
  return isNullOrUndefined(str) || str === "" || /^\s*$/.test(str);
}

export function isNotBlank(str: string): boolean {
  return !isBlank(str);
}

export function getUnixtime(): number {
  return getUnixtimeFromDate(new Date());
}

export function getUnixtimeFromDate(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function sleep(timeInMilliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, timeInMilliseconds));
}
