import {AXIOS_STATUS_CODES} from "../../../src/utils/http";

describe("Unit: http", () => {

  it("returns correctly when checking status codes", () => {

    for (let i = 0; i < 600; i++) {
      expect(AXIOS_STATUS_CODES.ALL(i)).toBeTruthy();
      i < 300 ?
        expect(AXIOS_STATUS_CODES.STATUS_2XX(i)).toBeTruthy() : expect(AXIOS_STATUS_CODES.STATUS_2XX(i)).toBeFalsy();
      i < 400 ?
        expect(AXIOS_STATUS_CODES.STATUS_3XX(i)).toBeTruthy() : expect(AXIOS_STATUS_CODES.STATUS_2XX(i)).toBeFalsy();
      i < 500 ?
        expect(AXIOS_STATUS_CODES.STATUS_4XX(i)).toBeTruthy() : expect(AXIOS_STATUS_CODES.STATUS_2XX(i)).toBeFalsy();
    }
  });
});
