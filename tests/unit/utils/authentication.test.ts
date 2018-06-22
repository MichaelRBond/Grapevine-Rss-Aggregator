import { genApikey, genHash, genSalt, genSaltedApikey, validateApikey } from "../../../src/utils/authentication";

describe("Unit: authentication", () => {
  describe("genSalt", () => {
    it("returns a 16 byte hex", () => {
      const result = genSalt();
      expect(result.length).toEqual(32);
    });
  });

  describe("genApikey", () => {
    it("returns random apikeys", () => {
      const passwd1 = genApikey();
      const passwd2 = genApikey();
      expect(passwd1).not.toEqual(passwd2);
      expect(passwd1.length).toEqual(32);
      expect(passwd2.length).toEqual(32);
    });
  });

  describe("genSaltedApikey()", () => {
    const salt = genSalt();
    const apikey = genApikey();
    const result = genSaltedApikey(salt, apikey);
    expect(result).toEqual(`${salt}-${apikey}`);
  });

  describe("genHash()", () => {
    it("returns a hashed password that validates", async () => {
      const salt = genSalt();
      const apikey = genApikey();
      const rounds = 10;
      const saltedApikey = genSaltedApikey(salt, apikey);

      const hash1 = await genHash(salt, apikey, rounds);
      const hash2 = await genHash(salt, apikey, rounds);

      expect(hash1.length).toEqual(60);
      expect(hash2.length).toEqual(60);
      expect(hash1).not.toEqual(hash2);

      expect(await validateApikey(saltedApikey, hash1)).toEqual(true);
      expect(await validateApikey(saltedApikey, hash2)).toEqual(true);
    });
  });
});
