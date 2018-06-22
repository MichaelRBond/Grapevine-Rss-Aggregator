import * as bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import { generate } from "generate-password";
import { Request, ResponseToolkit } from "hapi";
import { ValidateCustomResponse, ValidateResponse } from "hapi-auth-basic";

export async function validate(
  request: Request,
  username: string,
  password: string,
  h: ResponseToolkit,
): Promise<ValidateResponse | ValidateCustomResponse> {

  if (!username || !password) {
    return {isValid: false};
  }

  // Get account from database
  // if account is null, return invalid
  // get hashed from database
  // get salted apikey
  if (!validateApikey(saltedApikey, hashedApikey)) {
    return {isValid: false};
  }

  return {
    credentials: {
      id: account.id,
      username,
    },
    isValid: true,
  };

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
