import { Server } from "hapi";
import { config } from "./config";
import { FeedsController } from "./endpoints/feed-controller";
import { EndpointController } from "./models/endpoint-controller";

const feed: FeedsController = new FeedsController();

const endpointControllers: EndpointController[] = [
  feed,
];

getHapiServer(endpointControllers).then((server) => {
  server.start();
  return server;
}).then((server) => {
  console.log(`Hapi Running at: ${server.info.uri}`); // tslint:disable-line
}).catch((err) => {
  throw err;
});

async function getHapiServer(controllers: EndpointController[]): Promise<Server> {
  const server = new Server({
    host: config.hapi.host,
    port: config.hapi.port,
  });

  controllers.forEach((c) => {
    server.route(c.registerRoutes());
  });

  await server.initialize();

  return server;
}
