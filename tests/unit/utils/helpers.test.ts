import {
  convertStringToStream,
  getUnixtime,
  getUnixtimeFromDate,
  isBlank,
  isNotBlank,
} from "../../../src/utils/helpers";

describe("Unit: helpers", () => {
  describe("Unit: convertStringToStream", () => {
    it("returns a stream when given a string", () => {
      const stream = convertStringToStream("test");
      expect(stream.pipe).toBeDefined();
      expect(stream.on).toBeDefined();
    });
  });

  describe("isBlank()", () => {
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

  describe("isNotBlank()", () => {
    it("returns false when given a null or undefined value", () => {
      expect(isNotBlank(null)).toEqual(false);
      expect(isNotBlank(undefined)).toEqual(false);
    });

    it("returns false when given a zero length string", () => {
      expect(isNotBlank("")).toEqual(false);
    });

    it("returns false when given a string with only spaces", () => {
      expect(isNotBlank("                    ")).toEqual(false);
      expect(isNotBlank("  ")).toEqual(false); // Tab
    });

    it("returns true when given a non-empty string", () => {
      expect(isNotBlank("test")).toEqual(true);
    });
  });

  describe("getUnixtimeFromDate", () => {
    it("returns the expected unix time", () => {
      const date = new Date(1519087999000);
      expect(date.toUTCString()).toEqual("Tue, 20 Feb 2018 00:53:19 GMT");
      expect(getUnixtimeFromDate(date)).toEqual(1519087999);
    });
  });

  describe("getUnixTime", () => {
    it("returns an integer that is <= the current time", () => {
      const time = getUnixtime();
      expect(time).toBeLessThanOrEqual(Date.now() / 1000);
    });
  });

  describe("sleep", () => {
    it.skip("sleeps the appropriate length of time", () => { /* */ });
  });

});
