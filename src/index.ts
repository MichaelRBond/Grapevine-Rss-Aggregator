import { CronJob } from "cron";
import { Server } from "hapi";
import { mysqlClientProvider } from "./clients/mysql-client";
import { config } from "./config";
import { RssFeedDao } from "./dao/rss-feed";
import { RssItemDao } from "./dao/rss-item";
import { FeedsController } from "./endpoints/feed-controller";
import { EndpointController } from "./models/endpoint-controller";
import { Rss } from "./models/rss";
import { DateTime } from "./utils/date-time";
import { FeedParser } from "./utils/feed-parser";
import { Http } from "./utils/http";
import { logger } from "./utils/logger";

const feedParser = new FeedParser();
const http = new Http();
const datetime = new DateTime();
const rssFeedDao = new RssFeedDao(mysqlClientProvider, datetime);
const rssItemDao = new RssItemDao(mysqlClientProvider);
const rssModel = new Rss(rssFeedDao, rssItemDao, feedParser, http);
const feed: FeedsController = new FeedsController(rssModel);

const endpointControllers: EndpointController[] = [
  feed,
];

// TODO : Refactor
const rssFetchJob = new CronJob({
  cronTime: config.schedule,
  onTick: async () => {
    return await rssModel.fetchFeeds();
  },
  start: false,
});
rssFetchJob.start();

getHapiServer(endpointControllers).then((server) => {
  server.start();
  return server;
}).then((server) => {
  logger.info(`Hapi Running at: ${server.info.uri}`);
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
