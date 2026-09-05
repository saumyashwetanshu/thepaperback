export interface RawArticle {
  title: string;
  source: string;
  url: string;
  pubDate: string;
  category: string;
  region?: string;
  state?: string;
  language?: string;
  languageConfidence?: number;
  description?: string;
  content?: string;
  extractionStatus?: 'EXTRACTED' | 'PARTIAL' | 'PAYWALLED' | 'BLOCKED' | 'NOT_ARTICLE' | 'FAILED' | 'PENDING';
  canonicalUrl?: string;
  sourceDomain?: string;
}

export interface NewsSourceConfig {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'atom' | 'html' | 'json';
  category: string;
  region: string;
  state?: string;
  tier: 'National' | 'Regional' | 'Local' | 'Hyperlocal';
  language: string;
}

export interface NewsSourceAdapter {
  type: 'rss' | 'atom' | 'html' | 'json';
  fetchArticles(config: NewsSourceConfig): Promise<RawArticle[]>;
}
