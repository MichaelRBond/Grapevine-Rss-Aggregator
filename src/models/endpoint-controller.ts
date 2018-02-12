import { ServerRoute } from "hapi";

export abstract class EndpointController {
    public abstract registerRoutes(): ServerRoute[];
}
