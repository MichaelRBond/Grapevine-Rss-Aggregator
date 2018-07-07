import { orElse, orElseThrow } from "../../../src/models/nullable";

describe("nullable", () => {
  describe("orElseThrow", () => {
    it("throws an error if provided with a null value", () => {
      try {
        orElseThrow(null, new Error("bad!"));
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err.message).toEqual("bad!");
      }
    });

    it("returns a value if the provided value is not null", () => {
      try {
        const result = orElseThrow("test", new Error("bad!"));
        expect(result).toEqual("test");
      } catch (err) {
        expect(true).toBeFalsy();
      }
    });
  });

  describe("orElse", () => {
    it("returns the default if value is null", () => {
      expect(orElse(null, 1)).toEqual(1);
    });

    it("returns the value if it is not null", () => {
      expect(orElse("foo", "bar")).toEqual("foo");
    });
  });
});
