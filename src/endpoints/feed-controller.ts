import { ServerRoute } from "hapi";
import { EndpointController } from "../models/endpoint-controller";

export class FeedsController extends EndpointController {

    public getFeeds(): string {
        return "hello world";
    }

    public registerRoutes(): ServerRoute {
        return {
            config: {
                handler: this.getFeeds,
            },
            method: "GET",
            path: "/api/v1/feed",
        };
    }
}
