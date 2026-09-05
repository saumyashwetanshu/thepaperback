import * as cheerio from 'cheerio';
import { extractArticle } from "./extract.readability";
import { feedHealth } from "./rss.health";
import { isJunkTitle } from "./clustering.service";
import { NEWS_SOURCES, OPINION_SOURCES, isOpinionOutlet } from './ingestion/sources';
import { RssAdapter } from './ingestion/adapters/rss.adapter';
import { HtmlAdapter } from './ingestion/adapters/html.adapter';
import { extractArticleContent, ExtractionResult } from './ingestion/extractor';
import { RawArticle, NewsSourceAdapter, NewsSourceConfig } from './ingestion/adapter.interface';

export { extractArticleContent };
export type { ExtractionResult };

export type { RawArticle };
export { isOpinionOutlet };
export const RSS_FEEDS = NEWS_SOURCES; // For backwards compatibility if imported

const rssAdapter = new RssAdapter();
const htmlAdapter = new HtmlAdapter();

export async function fetchAllSources(): Promise<RawArticle[][]> {
  const promises = NEWS_SOURCES.map(source => {
    let adapter: NewsSourceAdapter;
    if (source.type === 'rss') adapter = rssAdapter;
    else if (source.type === 'html') adapter = htmlAdapter;
    else return Promise.resolve([]);

    return adapter.fetchArticles(source);
  });
  
  return Promise.all(promises);
}

// Keep fetchRssFeed for backward compatibility just in case
export async function fetchRssFeed(url: string, category: string, region = "National", sourceName = "Unknown"): Promise<RawArticle[]> {
  const cfg: NewsSourceConfig = { id: 'legacy', name: sourceName, url, type: 'rss', category, region, tier: 'National', language: 'en' };
  return rssAdapter.fetchArticles(cfg);
}

function emptyScrape(url: string): ExtractionResult {
  return { text: "", status: "FAILED", canonicalUrl: url };
}

// Scrape with timeout now uses the robust extractor
export async function scrapeWithTimeout(url: string, ms = 10000): Promise<ExtractionResult> {
  try {
    const res = await Promise.race([
      extractArticleContent(url),
      new Promise<ExtractionResult>(resolve => setTimeout(() => resolve(emptyScrape(url)), ms)),
    ]);
    if (!res || typeof res !== "object") return emptyScrape(url);
    return {
      text: res.text || "",
      status: res.status || "FAILED",
      canonicalUrl: res.canonicalUrl || url,
    };
  } catch {
    return emptyScrape(url);
  }
}

// Backward compatibility
export async function scrapeArticleText(url: string): Promise<string> {
  const res = await scrapeWithTimeout(url);
  return res.text;
}
