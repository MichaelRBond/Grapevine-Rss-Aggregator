import { Server } from "hapi";
import { mysqlClientProvider } from "./clients/mysql-client";
import { config } from "./config";
import { RssDao } from "./dao/rss";
import { FeedsController } from "./endpoints/feed-controller";
import { EndpointController } from "./models/endpoint-controller";
import { Rss } from "./models/rss";
import { DateTime } from "./utils/date-time";

const datetime = new DateTime();
const rssDao = new RssDao(mysqlClientProvider, datetime);
const rssModel = new Rss(rssDao);
const feed: FeedsController = new FeedsController(rssModel);

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
