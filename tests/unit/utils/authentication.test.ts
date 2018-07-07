import { Request, ResponseToolkit, Server, ServerAuth } from "hapi";
import { Account, AccountModel } from "../../../src/models/accounts";
import { Authentication, genApikey, genHash, genSalt, genSaltedApikey,
  validateApikey } from "../../../src/utils/authentication";
import { Mock, mock, verify } from "../../utils/mockfill";

describe("Unit: Authentication class", () => {
  let accountModel: Mock<AccountModel>;
  let auth: Authentication;

  let request: Request;
  let h: ResponseToolkit;

  beforeEach(() => {
    accountModel = mock<AccountModel>();
    auth = new Authentication(accountModel);

    request = {} as Request;
    h = {} as ResponseToolkit;
  });

  describe("registerAuthStrategies()", () => {
    it("registers the correct number of authentication strategies and sets a default", () => {
      const server = mock<Server>();
      server.auth = mock<ServerAuth>();
      auth.registerAuthStrategies(server);
      verify(server.auth.strategy).calledOnce();
      verify(server.auth.default).calledWithArgsLike(([strategy]) => {
        expect(strategy).toEqual("basic");
        return true;
      });
    });
  });

  describe("validate()", () => {
    it ("returns invalid when there is no username", async () => {
      const result = await auth.validateBasicAuth(request, undefined, "bar", h);
      expect(result).toHaveProperty("isValid", false);
      verify(accountModel.getByUsername).notCalled();
    });

    it("returns invalid when there is no password", async () => {
      const result = await auth.validateBasicAuth(request, "foo", undefined, h);
      expect(result).toHaveProperty("isValid", false);
      verify(accountModel.getByUsername).notCalled();
    });

    it("returns invalid when an account cannot be found", async () => {
      accountModel.getByUsername = async () => null;
      const result = await auth.validateBasicAuth(request, "buddy-holly", "foo", h);
      expect(result).toHaveProperty("isValid", false);
      verify(accountModel.getByUsername).calledWithArgsLike(([username]) => {
        expect(username).toEqual("buddy-holly");
        return true;
      });
    });

    it("returns invalid when the credentials are incorrect", async () => {
      const salt = genSalt();
      const apiKey = genApikey();
      const hash = await genHash(salt, apiKey, 10);
      const account = {
        apikeyHash: hash,
        id: 2,
        salt,
        username: "foo",
      } as Account;
      accountModel.getByUsername = async () => account;
      const result = await auth.validateBasicAuth(request, "foo", "bar", h);
      expect(result).toHaveProperty("isValid", false);
      verify(accountModel.getByUsername).calledWithArgsLike(([username]) => {
        expect(username).toEqual("foo");
        return true;
      });
    });

    it("returns valid when the credentials are correct", async () => {
      const salt = genSalt();
      const apiKey = genApikey();
      const hash = await genHash(salt, apiKey, 10);
      const account = {
        apikeyHash: hash,
        id: 2,
        salt,
        username: "foo",
      } as Account;
      accountModel.getByUsername = async () => account;
      const result = await auth.validateBasicAuth(request, "foo", apiKey, h);

      expect(result).toHaveProperty("isValid", true);
      expect(result).toHaveProperty("credentials");
      expect(result.credentials).toHaveProperty("id", 2);
      expect(result.credentials).toHaveProperty("username", "foo");

      verify(accountModel.getByUsername).calledWithArgsLike(([username]) => {
        expect(username).toEqual("foo");
        return true;
      });
    });
  });
});

describe("Unit: authentication functions", () => {
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
