import * as FP from "feedparser";
import { isNullOrUndefined } from "util";
import { RssItemBase } from "../models/rss";
import { convertStringToStream, isBlank } from "./helpers";
import { getGuid } from "./rss";

export class FeedParser {
  public async parse(feedStr: string): Promise<RssItemBase[]> {
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

export function rssItemBaseFromFeedParser(item: FP.Item): RssItemBase {
  return {
    author: item.author,
    categories: item.categories,
    comments: item.comments, // a link to the article's comments section
    description: item.description,
    enclosures: item.enclosures,
    guid: getGuid(item),
    image: item.image,
    link: isBlank(item.origlink) ? item.link : item.origlink,
    published: isNullOrUndefined(item.pubdate) ? item.date : item.pubdate, // when originally published
    summary: item.summary,
    title: item.title,
    updated: isNullOrUndefined(item.date) ? item.pubdate : item.date, // most recent update
  };
}
