import Parser from 'rss-parser';
import { NewsSourceAdapter, NewsSourceConfig, RawArticle } from '../adapter.interface';
import { isJunkTitle } from '../../clustering.service';
import { feedHealth } from '../../rss.health';

export class RssAdapter implements NewsSourceAdapter {
  type: 'rss' = 'rss';
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      timeout: 8000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
      }
    });
  }

  async fetchArticles(config: NewsSourceConfig): Promise<RawArticle[]> {
    try {
      let feedItems: any[] = [];
      try {
        const parsed = await this.parser.parseURL(config.url);
        feedItems = parsed.items || [];
      } catch (urlErr) {
        // Fallback to fetch if parseURL fails (e.g., due to strict XML parsing)
        const res = await fetch(config.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml, */*"
          },
          signal: AbortSignal.timeout(8000)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let xml = await res.text();
        
        // Clean up messy XML
        xml = xml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        xml = xml.replace(/\basync\b/g, '');
        xml = xml.replace(/&(?!(?:apos|quot|[a-zA-Z]{2,6}|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
        
        const feed = await this.parser.parseString(xml);
        feedItems = feed.items || [];
      }

      feedHealth.markOk(config.name, config.url);
      const items: RawArticle[] = [];

      for (const item of feedItems) {
        const title = item.title ? item.title.trim() : "";
        const rawUrl = item.link ? item.link.trim() : "";
        const pubDate = item.pubDate ? item.pubDate.trim() : new Date().toISOString();
        const source = config.name;
        const rawDesc = (item as any).contentSnippet || (item as any).summary || item.content || "";
        const description = String(rawDesc).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 800);

        if (title && rawUrl && !isJunkTitle(title)) {
          items.push({ 
            title, 
            source, 
            url: rawUrl, 
            pubDate, 
            category: config.category, 
            region: config.region, 
            state: config.state,
            language: config.language,
            description,
            extractionStatus: 'PENDING'
          });
        }
      }
      return items;
    } catch (err) {
      feedHealth.markError(config.name, config.url, String((err as any)?.message || err));
      console.error(`[RssAdapter] Failed to parse RSS feed ${config.url}:`, (err as any)?.message || err);
      return [];
    }
  }
}
