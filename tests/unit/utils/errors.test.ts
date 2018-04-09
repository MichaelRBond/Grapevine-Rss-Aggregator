import { thrownErrMsg, transformErrors } from "../../../src/utils/errors";

describe("Unit: transformErrors", () => {
  it("replaces variables in errors", () => {
    const result = transformErrors(thrownErrMsg.testing, {
      adjective: "long",
      noun: "sentence",
    });
    expect(result).toEqual("This is a long sentence. It is for testing long tests");
  });
});
