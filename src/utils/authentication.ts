import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { generate } from "generate-password";
import { Request, ResponseToolkit, Server } from "hapi";
import { ValidateResponse } from "hapi-auth-basic";
import { get, isNull } from "nullable-ts";
import { AccountModel } from "../models/accounts";

export class Authentication {

  private invalid = {isValid: false};

  constructor(
    private accountModel: AccountModel,
  ) {
    this.registerAuthStrategies = this.registerAuthStrategies.bind(this);
    this.validateBasicAuth = this.validateBasicAuth.bind(this);
  }

  public registerAuthStrategies(server: Server): void {
    server.auth.strategy("basic", "basic", { validate: this.validateBasicAuth });
    server.auth.default("basic");
    return;
  }

  public async validateBasicAuth(
    request: Request,
    username: string,
    password: string,
    h: ResponseToolkit,
  ): Promise<ValidateResponse> {

    if (!username || !password) {
      return this.invalid;
    }

    const accountNullable = await this.accountModel.getByUsername(username);
    if (isNull(accountNullable)) {
      return this.invalid;
    }

    const account = get(accountNullable);

    const saltedApikey = genSaltedApikey(account.salt, password);
    if (!(await validateApikey(saltedApikey, account.apikeyHash))) {
      return this.invalid;
    }

    return {
      credentials: {
        id: account.id,
        username,
      },
      isValid: true,
    };

  }
}

export function genSalt(): string {
  return randomBytes(16).toString("hex");
}

export function genApikey(): string {
  return generate({
    excludeSimilarCharacters: true,
    length: 32,
    numbers: true,
    strict: true,
    symbols: true,
    uppercase: true,
  });
}

export async function genHash(salt: string, apikey: string, rounds: number): Promise<string> {
  return bcrypt.hash(genSaltedApikey(salt, apikey), rounds);
}

export async function validateApikey(saltedApikey: string, hashedApikey: string): Promise<boolean> {
  return bcrypt.compare(saltedApikey, hashedApikey);
}

export function genSaltedApikey(salt: string, apikey: string): string {
  return `${salt}-${apikey}`;
}
