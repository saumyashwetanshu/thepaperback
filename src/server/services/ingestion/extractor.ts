import * as cheerio from 'cheerio';
import { extractArticle } from '../extract.readability';

export interface ExtractionResult {
  text: string;
  status: 'EXTRACTED' | 'PARTIAL' | 'PAYWALLED' | 'BLOCKED' | 'NOT_ARTICLE' | 'FAILED';
  canonicalUrl: string;
}

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const ACCEPT_LANG = 'en-IN,en;q=0.9,hi;q=0.8';

const TEXT_CAP = 50000;
const EXTRACTED_MIN = 500;
const PARAGRAPH_MIN = 40;

const PAYWALL_SELECTORS = ['.paywall', '#paywall-container', '.premium-content', '.subscriber-only'];

/** Per-host CSS selectors for Indian desks. Hostname with www. stripped. */
const HOST_SELECTORS: Record<string, string[]> = {
  'thehindu.com': ['#articlebodycontent', '.articlebodycontent', '[itemprop="articleBody"]', '.article-body', 'article'],
  'indianexpress.com': ['.story_details', '#pcl-full-content', '[itemprop="articleBody"]', '.full-details', 'article'],
  'timesofindia.indiatimes.com': ['.artText', '[itemprop="articleBody"]', '.Normal', '.article-content', 'article'],
  'm.timesofindia.com': ['.artText', '[itemprop="articleBody"]', '.Normal', 'article'],
  'navbharattimes.indiatimes.com': ['.artText', '[itemprop="articleBody"]', 'article'],
  'hindustantimes.com': ['.storyDetails', '.articleBody', '[itemprop="articleBody"]', '.storyDetail', '.detail', 'article'],
  'ndtv.com': ['.sp-cn', '.story__content', '[itemprop="articleBody"]', '.ins_storybody', 'article'],
  'ndtv.in': ['.sp-cn', '.story__content', '[itemprop="articleBody"]', '.ins_storybody', 'article'],
  'indiatoday.in': ['.story-description', '.Story_description', '.story-details', '[itemprop="articleBody"]', 'article'],
  'livemint.com': ['.storyPage_storyContent', '[itemprop="articleBody"]', '.livePremiumContent', 'article'],
  'economictimes.indiatimes.com': ['.artText', '[itemprop="articleBody"]', 'article'],
  'thewire.in': ['.wrapped-content', '.article__body', 'article'],
  'scroll.in': ['.article-body', '#article-contents', 'article'],
  'theprint.in': ['.td-post-content', '[itemprop="articleBody"]', 'article'],
  'aajtak.in': ['.story-content', '.content-area', '.story-detail', '.storybody', 'article'],
  'www.aajtak.in': ['.story-content', '.content-area', '.story-detail', 'article'],
  'amarujala.com': ['.article-desc', '.desc', 'article'],
  'bhaskar.com': ['.story-detail', '.story-content', 'article'],
  'livehindustan.com': ['article', '.story-content', '.storyDetail'],
  'barandbench.com': ['article', '.entry-content'],
  'livelaw.in': ['article', '.entry-content', '.news_content'],
  'thenewsminute.com': ['article', '.entry-content', '[itemprop="articleBody"]'],
  'eastmojo.com': ['article', '.entry-content', '[itemprop="articleBody"]'],
  'telegraphindia.com': ['article', '.entry-content', '[itemprop="articleBody"]', '.story-content'],
  'downtoearth.org.in': ['article', '.entry-content', '[itemprop="articleBody"]'],
  'news18.com': ['.story_section', '.articlebodycontent', '[itemprop="articleBody"]', 'article'],
  'zeenews.india.com': ['.article-content', '.content', '[itemprop="articleBody"]', 'article'],
  'opindia.com': ['article', '.entry-content', '.tdb-block-inner'],
  'thequint.com': ['article', '.story-element', '[itemprop="articleBody"]'],
};

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function cap(text: string): string {
  return text.length > TEXT_CAP ? text.slice(0, TEXT_CAP) : text;
}

function unique(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

function ampCandidates(articleUrl: string): string[] {
  let u: URL;
  try {
    u = new URL(articleUrl);
  } catch {
    return [articleUrl];
  }
  const host = u.hostname.replace(/^www\./i, '').toLowerCase();
  const path = u.pathname;
  const alreadyAmp =
    /\/amp\/?$/i.test(path) ||
    /\/amp\//i.test(path) ||
    u.searchParams.has('amp') ||
    u.searchParams.get('outputType') === 'amp' ||
    host.startsWith('m.');
  if (alreadyAmp) return [articleUrl];

  const out: string[] = [articleUrl];

  // Mobile hosts (often less paywalled)
  if (host === 'timesofindia.indiatimes.com') {
    out.push(`https://m.timesofindia.com${path}${u.search}`);
    out.push(`${u.origin}${path}?print=1`);
  }
  if (host === 'hindustantimes.com') {
    out.push(`https://www.hindustantimes.com/amp${path}${u.search}`);
  }
  if (host === 'thehindu.com' || host.endsWith('.thehindu.com')) {
    const amp = new URL(articleUrl);
    amp.searchParams.set('amp', '');
    out.push(amp.toString());
    out.push(`${u.origin}${path}?amp=1`);
  }
  if (host === 'indianexpress.com') {
    out.push(`${u.origin}/amp${path}${u.search}`);
    out.push(`${u.origin}${path.replace(/\/?$/, '/') }lite/${u.search}`);
  }
  if (host === 'ndtv.com' || host === 'ndtv.in') {
    out.push(`${u.origin}${path.replace(/\/?$/, '/amp')}${u.search}`);
    const q = new URL(articleUrl);
    q.searchParams.set('outputType', 'amp');
    out.push(q.toString());
  }
  if (host === 'livemint.com' || host === 'hindustantimes.com' || host === 'indiatoday.in') {
    out.push(`${u.origin}/amp${path}${u.search}`);
    out.push(`${u.origin}${path.replace(/\/?$/, '/amp')}${u.search}`);
  }
  if (host === 'aajtak.in' || host.endsWith('.aajtak.in')) {
    out.push(`${u.origin}/amp${path}${u.search}`);
    out.push(`https://www.aajtak.in/amp${path}${u.search}`);
  }

  // Generic AMP / print fallbacks
  out.push(`${u.origin}${path.replace(/\/?$/, '/amp')}${u.search}`);
  if (!path.startsWith('/amp/')) {
    out.push(`${u.origin}/amp${path}${u.search}`);
  }
  const outputAmp = new URL(articleUrl);
  outputAmp.searchParams.set('outputType', 'amp');
  out.push(outputAmp.toString());
  const printQ = new URL(articleUrl);
  printQ.searchParams.set('print', '1');
  out.push(printQ.toString());

  return unique(out);
}

type FetchOk = { html: string; finalUrl: string; status: number };
type FetchBlocked = { blocked: true; status: number };
type FetchFailed = { failed: true; status?: number };

function refererFor(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}/`;
  } catch {
    return 'https://www.google.com/';
  }
}

async function fetchHtmlOnce(url: string, extraHeaders: Record<string, string> = {}): Promise<FetchOk | FetchBlocked | FetchFailed> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': CHROME_UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': ACCEPT_LANG,
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        'Upgrade-Insecure-Requests': '1',
        Referer: refererFor(url),
        ...extraHeaders,
      },
      signal: AbortSignal.timeout(12000),
      redirect: 'follow',
    });
    if (res.status === 403 || res.status === 401) {
      return { blocked: true, status: res.status };
    }
    if (!res.ok) {
      return { failed: true, status: res.status };
    }
    const html = await res.text();
    return { html, finalUrl: res.url || url, status: res.status };
  } catch {
    return { failed: true };
  }
}

/** Fetch HTML; on 403 retry once with Google referer (desk soft-blocks). */
async function fetchHtml(url: string): Promise<FetchOk | FetchBlocked | FetchFailed> {
  const first = await fetchHtmlOnce(url);
  if (!('blocked' in first)) return first;
  // One honest retry — different Referer only; AMP variants are tried by the caller loop.
  return fetchHtmlOnce(url, { Referer: 'https://www.google.co.in/' });
}

function collectParagraphs($: any, root?: any): string[] {
  const paras: string[] = [];
  const nodes = root ? root.find('p') : $('p');
  nodes.each((_: unknown, el: unknown) => {
    const pText = $(el).text().replace(/\s+/g, ' ').trim();
    if (pText.length > PARAGRAPH_MIN) paras.push(pText);
  });
  return paras;
}

function cssExtract($: any, host: string): string {
  const selectors = HOST_SELECTORS[host];
  if (!selectors) return '';
  const paras: string[] = [];
  const seen = new Set<string>();
  for (const sel of selectors) {
    $(sel).each((_: unknown, el: unknown) => {
      const $el = $(el);
      const inner = collectParagraphs($, $el);
      if (inner.length) {
        for (const p of inner) {
          if (!seen.has(p)) {
            seen.add(p);
            paras.push(p);
          }
        }
      } else {
        const t = $el.text().replace(/\s+/g, ' ').trim();
        if (t.length > PARAGRAPH_MIN && !seen.has(t)) {
          seen.add(t);
          paras.push(t);
        }
      }
    });
    if (paras.join('\n').length >= EXTRACTED_MIN) break;
  }
  return paras.join('\n').trim();
}

function jsonLdArticleBody($: any): string {
  const bodies: string[] = [];
  $('script[type="application/ld+json"]').each((_: unknown, el: unknown) => {
    const raw = $(el).contents().text() || $(el).html() || '';
    if (!raw.trim()) return;
    try {
      // Clean potential unescaped control chars before parsing
      const sanitized = raw.replace(/[\u0000-\u001F]+/g, ' ');
      const parsed = JSON.parse(sanitized);
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      const all: any[] = [];
      for (const n of nodes) {
        if (!n) continue;
        all.push(n);
        if (Array.isArray(n['@graph'])) all.push(...n['@graph']);
        if (Array.isArray(n.itemListElement)) {
          for (const item of n.itemListElement) {
            if (item && item.item) all.push(item.item);
          }
        }
      }
      for (const n of all) {
        if (!n) continue;
        if (typeof n.articleBody === 'string' && n.articleBody.trim()) {
          bodies.push(n.articleBody.trim());
        } else if (Array.isArray(n.articleBody)) {
          bodies.push(n.articleBody.filter(Boolean).join('\n\n').trim());
        } else if (typeof n.text === 'string' && n.text.length > 200) {
          bodies.push(n.text.trim());
        } else if (typeof n.description === 'string' && n.description.length > 250 && bodies.length === 0) {
          bodies.push(n.description.trim());
        }
      }
    } catch {
      // ignore malformed JSON-LD
    }
  });
  return stripTags(bodies.join('\n\n'));
}

async function extractusText(html: string, url: string): Promise<string> {
  try {
    const mod: any = await import('@extractus/article-extractor');
    const extractFromHtml = mod.extractFromHtml || mod.default?.extractFromHtml;
    const extractFn = mod.extract || mod.default?.extract;
    let article: any = null;
    if (typeof extractFromHtml === 'function') {
      article = await extractFromHtml(html, url);
    } else if (typeof extractFn === 'function') {
      article = await extractFn(url);
    }
    if (!article) return '';
    const raw = String(article.content || article.text || '');
    return stripTags(raw);
  } catch {
    return '';
  }
}

function classify(text: string, hasPaywall: boolean): ExtractionResult['status'] {
  if (hasPaywall) return 'PAYWALLED';
  if (text.length < 150) return 'NOT_ARTICLE';
  if (text.length < EXTRACTED_MIN) return 'PARTIAL';
  return 'EXTRACTED';
}

function logExtract(host: string, method: string, chars: number, status: string, url: string) {
  console.log(`[extractor] host=${host} method=${method} chars=${chars} status=${status} url=${url}`);
}

export async function extractArticleContent(url: string): Promise<ExtractionResult> {
  const host = hostnameOf(url);
  const candidates = ampCandidates(url);
  let lastBlocked = false;
  let lastCanonical = url;
  let bestText = '';
  let bestMethod = 'failed';
  let bestStatus: ExtractionResult['status'] = 'FAILED';
  let sawHtml = false;

  for (const candidate of candidates) {
    const fetched = await fetchHtml(candidate);
    if ('blocked' in fetched) {
      lastBlocked = true;
      continue;
    }
    if ('failed' in fetched) {
      continue;
    }
    lastBlocked = false;
    sawHtml = true;
    const { html, finalUrl } = fetched;
    const $ = cheerio.load(html);

    let canonicalUrl = finalUrl;
    const canonicalTag = $('link[rel="canonical"]').attr('href');
    if (canonicalTag && /^https?:\/\//i.test(canonicalTag)) {
      canonicalUrl = canonicalTag;
    }
    lastCanonical = canonicalUrl;

    const ampLink = $('link[rel="amphtml"]').attr('href');
    if (ampLink) {
      try {
        const abs = new URL(ampLink, finalUrl).toString();
        if (!candidates.includes(abs)) candidates.push(abs);
      } catch {
        // ignore bad amphtml href
      }
    }

    const hasPaywall = PAYWALL_SELECTORS.some((sel) => $(sel).length > 0);
    const fromAmp = candidate !== url;

    const viaExtractus = cap(await extractusText(html, canonicalUrl));
    if (viaExtractus.length >= EXTRACTED_MIN) {
      const status = classify(viaExtractus, hasPaywall);
      const method = fromAmp ? 'amp' : 'extractus';
      logExtract(host, method, viaExtractus.length, status, canonicalUrl);
      return { text: viaExtractus, status, canonicalUrl };
    }
    if (viaExtractus.length > bestText.length) {
      bestText = viaExtractus;
      bestMethod = fromAmp ? 'amp' : 'extractus';
      bestStatus = classify(viaExtractus, hasPaywall);
    }

    const viaJsonLd = cap(jsonLdArticleBody($));
    if (viaJsonLd.length >= EXTRACTED_MIN) {
      const status = classify(viaJsonLd, hasPaywall);
      logExtract(host, 'jsonld', viaJsonLd.length, status, canonicalUrl);
      return { text: viaJsonLd, status, canonicalUrl };
    }
    if (viaJsonLd.length > bestText.length) {
      bestText = viaJsonLd;
      bestMethod = 'jsonld';
      bestStatus = classify(viaJsonLd, hasPaywall);
    }

    const viaCss = cap(cssExtract($, host));
    if (viaCss.length >= EXTRACTED_MIN) {
      const status = classify(viaCss, hasPaywall);
      logExtract(host, `css:${host}`, viaCss.length, status, canonicalUrl);
      return { text: viaCss, status, canonicalUrl };
    }
    if (viaCss.length > bestText.length) {
      bestText = viaCss;
      bestMethod = `css:${host}`;
      bestStatus = classify(viaCss, hasPaywall);
    }

    $('script, style, nav, header, footer, aside, iframe, .ad, .advertisement, .social-share, .cookie-banner').remove();
    const cleanHtml = $.html();
    const extracted = extractArticle(cleanHtml, canonicalUrl);
    let viaRead = '';
    if (extracted && extracted.text.length > 150) {
      viaRead = cap(extracted.text);
    } else {
      viaRead = cap(collectParagraphs($).join('\n'));
    }
    if (viaRead.length >= EXTRACTED_MIN) {
      const status = classify(viaRead, hasPaywall);
      logExtract(host, fromAmp ? 'amp' : 'readability', viaRead.length, status, canonicalUrl);
      return { text: viaRead, status, canonicalUrl };
    }
    if (viaRead.length > bestText.length) {
      bestText = viaRead;
      bestMethod = fromAmp ? 'amp' : 'readability';
      bestStatus = classify(viaRead, hasPaywall);
    }
  }

  if (!sawHtml) {
    const status = lastBlocked ? 'BLOCKED' : 'FAILED';
    logExtract(host, 'failed', 0, status, url);
    return { text: '', status, canonicalUrl: url };
  }

  if (bestStatus === 'PAYWALLED') {
    logExtract(host, bestMethod, bestText.length, 'PAYWALLED', lastCanonical);
    return { text: cap(bestText), status: 'PAYWALLED', canonicalUrl: lastCanonical };
  }

  if (bestText.length < 150) {
    logExtract(host, 'failed', bestText.length, 'NOT_ARTICLE', lastCanonical);
    return { text: '', status: 'NOT_ARTICLE', canonicalUrl: lastCanonical };
  }

  logExtract(host, bestMethod, bestText.length, bestStatus, lastCanonical);
  return { text: cap(bestText), status: bestStatus, canonicalUrl: lastCanonical };
}
