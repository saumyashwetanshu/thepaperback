import { RSS_FEEDS, fetchRssFeed } from '../server/services/scraper.service.js';
import dbPromise from '../utils/db.js';
import { detectLanguage } from '../server/services/nlp/language.service.js';
import fs from 'fs';
import path from 'path';

async function runAudit() {
  console.log('Starting Live News Network Forensic Audit...');
  const db = await dbPromise;
  const results = [];
  
  for (const feed of RSS_FEEDS) {
    console.log(`\nTesting: ${feed.name} (${feed.url})`);
    const result = {
      sourceName: feed.name,
      domain: new URL(feed.url).hostname,
      sourceType: 'RSS',
      country: 'India',
      region: feed.region,
      state: 'Various',
      city: 'Various',
      language: 'Unknown',
      feedType: 'Standard',
      url: feed.url,
      configured: true,
      fetchAttempted: true,
      fetchSucceeded: false,
      httpStatus: 0,
      parseSucceeded: false,
      articlesFetched: 0,
      articlesStored: 0,
      articlesProcessed: 0,
      lastSuccessfulFetch: null,
      lastArticlePublished: null,
      currentlyLive: false,
      failureReason: null
    };

    // 1. Test manual fetch for HTTP Status
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: controller.signal
      });
      clearTimeout(timeout);
      
      result.httpStatus = res.status;
      if (res.ok) {
        result.fetchSucceeded = true;
      } else {
        result.failureReason = `HTTP ${res.status}`;
      }
    } catch (err) {
      result.httpStatus = 0;
      result.failureReason = `Fetch failed: ${err.message}`;
    }

    // 2. Test Parser and Articles
    try {
      if (result.fetchSucceeded || result.httpStatus === 0) { // sometimes manual fetch fails but parser fetch works
        const articles = await fetchRssFeed(feed.url, feed.category, feed.region, feed.name);
        result.articlesFetched = articles.length;
        if (articles.length > 0) {
          result.fetchSucceeded = true;
          result.parseSucceeded = true;
          
          // Detect language from first few articles
          const langs = articles.slice(0, 5).map(a => detectLanguage(a.title + " " + a.description).language);
          const langMap = {};
          let maxCount = 0;
          let maxLang = 'en';
          for (const l of langs) {
            langMap[l] = (langMap[l] || 0) + 1;
            if (langMap[l] > maxCount) { maxCount = langMap[l]; maxLang = l; }
          }
          result.language = maxLang;
          
          // Find most recent article date
          const dates = articles.map(a => new Date(a.pubDate).getTime()).filter(t => !isNaN(t));
          if (dates.length > 0) {
            result.lastArticlePublished = new Date(Math.max(...dates)).toISOString();
          }
          result.lastSuccessfulFetch = new Date().toISOString();
        } else if (result.fetchSucceeded) {
          result.failureReason = 'Parse failed or no articles returned';
        }
      }
    } catch (err) {
      if (!result.failureReason) result.failureReason = `Parse error: ${err.message}`;
    }

    // 3. Query DB for storage stats
    try {
      // Find articles in live_wire
      const liveWireQuery = await db.get(`SELECT count(*) as cnt FROM live_wire WHERE source = ?`, feed.name);
      result.articlesStored = liveWireQuery?.cnt || 0;
      
      // Find articles processed in stories
      const storiesQuery = await db.get(`
        SELECT count(*) as cnt FROM perspectives WHERE source = ?
      `, feed.name);
      result.articlesProcessed = storiesQuery?.cnt || 0;
      
    } catch (err) {
      console.error(`DB error for ${feed.name}:`, err.message);
    }
    
    // Determine LIVE status
    result.currentlyLive = result.fetchSucceeded && result.parseSucceeded && result.articlesFetched > 0;
    
    results.push(result);
  }

  const outPath = path.join(process.cwd(), 'source_runtime_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nAudit complete. Wrote ${results.length} sources to ${outPath}`);
  
  // Aggregate stats
  const total = results.length;
  const live = results.filter(r => r.currentlyLive).length;
  const failed = total - live;
  
  console.log(`Summary: ${live} live, ${failed} failed.`);
}

runAudit().catch(console.error);
