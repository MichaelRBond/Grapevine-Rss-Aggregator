import * as FP from "feedparser";
import { RssItemBase, rssItemBaseFromFeedParser } from "../models/rss";
import { convertStringToStream } from "./helpers";

export class FeedParser {
  // TODO : Type better
  public async parse(feedStr: string, feedUrl: string): Promise<RssItemBase[]> {
    const items: any[] = [];

    const stream = convertStringToStream(feedStr);
    await new Promise((resolve, reject) => {
      const fp = new FP({});
      stream.pipe(fp);
      fp.on("error", reject);
      fp.on("readable", () => {
        let item = fp.read();

        while (item) {
          items.push(item);
          item = fp.read();
        }
      });
      fp.on("end", resolve);
    });

    return items.map(rssItemBaseFromFeedParser);
  }

}
