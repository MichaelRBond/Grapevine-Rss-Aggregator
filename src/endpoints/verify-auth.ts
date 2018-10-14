import { ServerRoute } from "hapi";
import * as Joi from "joi";
import { EndpointController } from "../models/endpoint-controller";

interface RssVerifyAuthResponse {
  verification: boolean;
}

const joiReponse = {
  verification: Joi.boolean(),
};

export class VerifyAuthController extends EndpointController {

  public async verify(): Promise<RssVerifyAuthResponse> {
    return {verification: true};
  }

  public registerRoutes(): ServerRoute[] {
    return [
      {
        method: "GET",
        options: {
          handler: this.verify,
          response: {
            schema: joiReponse,
          },
        },
        path: "/api/v1/account/verify",
      },
    ];
  }
}
