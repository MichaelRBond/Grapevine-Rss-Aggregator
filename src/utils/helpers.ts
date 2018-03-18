import { Readable, Stream } from "stream";
import { isNullOrUndefined } from "util";

export function convertStringToStream(str: string): Stream {
  const stream = new Readable();
  stream.push(str);   // the string you want
  stream.push(null);
  return stream;
}

export function isBlank(str: string): boolean {
  return isNullOrUndefined(str) || str === "" || /^\s*$/.test(str);
}

export function getUnixtimeFromDate(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}
