import { DateTime } from "../../../src/utils/date-time";

describe("Util: date-time", () => {
  const datetime = new DateTime();

  it("returns time in ms", () => {
    const result = datetime.dateNowInMilliseconds();
    expect(result.toString().length).toEqual(13);
    expect(Number(result.toString())).toEqual(result);
  });

  it("returns time in seconds", () => {
    const result = datetime.dateNoWInSeconds();
    expect(result.toString().length).toEqual(10);
    expect(Number(result.toString())).toEqual(result);
  });
});
