import {
  convertStringToStream,
  getUnixtimeFromDate,
  isBlank,
} from "../../../src/utils/helpers";

describe("Unit: helpers: convertStringToStream", () => {
  it("returns a stream when given a string", () => {
    const stream = convertStringToStream("test");
    expect(stream.pipe).toBeDefined();
    expect(stream.on).toBeDefined();
  });
});

describe("Unit: helpers: isBlank()", () => {
  it("returns true when given a null or undefined value", () => {
    expect(isBlank(null)).toEqual(true);
    expect(isBlank(undefined)).toEqual(true);
  });

  it("returns true when given a zero length string", () => {
    expect(isBlank("")).toEqual(true);
  });

  it("returns true when given a string with only spaces", () => {
    expect(isBlank("                    ")).toEqual(true);
    expect(isBlank("  ")).toEqual(true); // Tab
  });

  it("returns false when given a non-empty string", () => {
    expect(isBlank("test")).toEqual(false);
  });
});

describe("Unit: helpers: getUnittimeFromDate", () => {
  const date = new Date(1519087999000);
  expect(date.toString()).toEqual("Mon Feb 19 2018 19:53:19 GMT-0500 (EST)");
  expect(getUnixtimeFromDate(date)).toEqual(1519087999);
});
