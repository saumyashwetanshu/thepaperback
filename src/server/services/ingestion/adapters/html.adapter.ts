import * as cheerio from 'cheerio';
import { NewsSourceAdapter, NewsSourceConfig, RawArticle } from '../adapter.interface';
import { feedHealth } from '../../rss.health';
import { isJunkTitle } from '../../clustering.service';

export class HtmlAdapter implements NewsSourceAdapter {
  type: 'html' = 'html';

  async fetchArticles(config: NewsSourceConfig): Promise<RawArticle[]> {
    try {
      const res = await fetch(config.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const $ = cheerio.load(html);
      
      const items: RawArticle[] = [];
      const seenUrls = new Set<string>();

      // Generic heuristic: Look for article links
      $('a').each((_, el) => {
        const href = $(el).attr('href');
        const title = $(el).text().trim().replace(/\s+/g, ' ');
        
        if (!href || href.length < 15 || title.length < 20) return;
        if (isJunkTitle(title)) return;
        
        // Ensure it's likely an article URL (year, article slug, CMS id, or a deep path)
        const looksArticle = href.match(/\/\d{4}\//) || href.match(/-news-/) || href.match(/article/i) || href.match(/articleshow/i) || href.match(/\.ece\b/i) || href.match(/story/i) || href.split('/').filter(Boolean).length >= 3;
        if (!looksArticle) return;

        let absoluteUrl = href;
        if (href.startsWith('/')) {
            const urlObj = new URL(config.url);
            absoluteUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
        } else if (!href.startsWith('http')) {
            return; // skip relative links without leading slash for now
        }

        if (seenUrls.has(absoluteUrl)) return;
        seenUrls.add(absoluteUrl);

        items.push({
          title,
          source: config.name,
          url: absoluteUrl,
          pubDate: new Date().toISOString(), // We might not have date on the listing
          category: config.category,
          region: config.region,
          state: config.state,
          language: config.language,
          description: "", // Might extract from DOM later
          extractionStatus: 'PENDING'
        });
      });

      feedHealth.markOk(config.name, config.url);
      
      // Sort by length of URL (often longer URLs are deeper articles) or just take first N
      return items.slice(0, 30);
    } catch (err) {
      feedHealth.markError(config.name, config.url, String((err as any)?.message || err));
      console.error(`[HtmlAdapter] Failed to fetch HTML for ${config.url}:`, (err as any)?.message || err);
      return [];
    }
  }
}
