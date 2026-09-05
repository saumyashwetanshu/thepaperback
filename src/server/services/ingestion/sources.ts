import { NewsSourceConfig } from './adapter.interface';

export const NEWS_SOURCES: NewsSourceConfig[] = [
  // Major National English Desks
  { id: 'the-hindu', name: "The Hindu", url: "https://www.thehindu.com/news/national/feeder/default.rss", type: 'rss', category: "Politics & Governance", region: "National", tier: "National", language: "en" },
  { id: 'indian-express', name: "Indian Express", url: "https://indianexpress.com/section/india/feed/", type: 'rss', category: "Politics & Governance", region: "National", tier: "National", language: "en" },
  { id: 'times-of-india', name: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", type: 'rss', category: "National", region: "National", tier: "National", language: "en" },
  { id: 'hindustan-times', name: "Hindustan Times", url: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml", type: 'rss', category: "National", region: "National", tier: "National", language: "en" },
  { id: 'ndtv', name: "NDTV", url: "https://feeds.feedburner.com/ndtvnews-india-news", type: 'rss', category: "National", region: "National", tier: "National", language: "en" },
  { id: 'india-today', name: "India Today", url: "https://www.indiatoday.in/rss/home", type: 'rss', category: "National", region: "National", tier: "National", language: "en" },
  { id: 'livemint', name: "Livemint", url: "https://www.livemint.com/rss/economy", type: 'rss', category: "Economy, Markets & Business", region: "National", tier: "National", language: "en" },
  { id: 'economic-times', name: "Economic Times", url: "https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms", type: 'rss', category: "Economy, Markets & Business", region: "National", tier: "National", language: "en" },
  { id: 'business-standard', name: "Business Standard", url: "https://www.business-standard.com/rss/home_page_top_stories.rss", type: 'rss', category: "Economy, Markets & Business", region: "National", tier: "National", language: "en" },
  { id: 'deccan-herald', name: "Deccan Herald", url: "https://www.deccanherald.com/rss/national.rss", type: 'rss', category: "National", region: "National", tier: "National", language: "en" },
  { id: 'bar-and-bench', name: "Bar and Bench", url: "https://www.barandbench.com/feed", type: 'rss', category: "Courts, Law & Constitution", region: "National", tier: "National", language: "en" },
  { id: 'livelaw', name: "LiveLaw", url: "https://www.livelaw.in/rss/feed", type: 'rss', category: "Courts, Law & Constitution", region: "National", tier: "National", language: "en" },
  { id: 'the-wire', name: "The Wire", url: "https://thewire.in/rss", type: 'rss', category: "Politics & Governance", region: "National", tier: "National", language: "en" },
  { id: 'scroll', name: "Scroll.in", url: "https://scroll.in/ro/rss", type: 'rss', category: "Politics & Governance", region: "National", tier: "National", language: "en" },
  { id: 'the-print', name: "ThePrint", url: "https://theprint.in/feed/", type: 'rss', category: "Politics & Governance", region: "National", tier: "National", language: "en" },
  { id: 'newslaundry', name: "Newslaundry", url: "https://www.newslaundry.com/feed", type: 'rss', category: "Politics & Governance", region: "National", tier: "National", language: "en" },
  
  // Major National Hindi Desks
  { id: 'ndtv-india', name: "NDTV India", url: "https://ndtv.in/india/rss", type: 'rss', category: "National", region: "National", tier: "National", language: "hi" }, // Replaced invalid feedburner URL
  { id: 'aaj-tak', name: "Aaj Tak", url: "https://www.aajtak.in/rssfeeds/?id=home", type: 'rss', category: "National", region: "National", tier: "National", language: "hi" },
  { id: 'amar-ujala', name: "Amar Ujala", url: "https://www.amarujala.com/rss/national-news.xml", type: 'rss', category: "National", region: "National", tier: "National", language: "hi" },
  { id: 'dainik-jagran', name: "Dainik Jagran", url: "https://english.jagran.com/rss/india.xml", type: 'rss', category: "National", region: "National", tier: "National", language: "en" },
  { id: 'dainik-bhaskar', name: "Dainik Bhaskar", url: "https://www.bhaskar.com/rss-feed/2014/", type: 'rss', category: "National", region: "National", tier: "National", language: "hi" },
  { id: 'navbharat-times', name: "Navbharat Times", url: "https://navbharattimes.indiatimes.com/india/rssfeed/46904128.cms", type: 'rss', category: "National", region: "National", tier: "National", language: "hi" },
  { id: 'hindustan', name: "Live Hindustan", url: "https://www.livehindustan.com/rss/national", type: 'rss', category: "National", region: "National", tier: "National", language: "hi" },

  // South India Desks
  { id: 'the-news-minute', name: "The News Minute", url: "https://www.thenewsminute.com/feed", type: 'rss', category: "States & Regions", region: "South", tier: "Regional", language: "en" },
  { id: 'the-south-first', name: "The South First", url: "https://thesouthfirst.com/feed/", type: 'rss', category: "States & Regions", region: "South", tier: "Regional", language: "en" },
  { id: 'mathrubhumi', name: "Mathrubhumi", url: "https://english.mathrubhumi.com/cmlink/mathrubhumi-english-1.2858888", type: 'rss', category: "States & Regions", region: "South", state: "Kerala", tier: "Regional", language: "en" },
  { id: 'manorama', name: "Onmanorama", url: "https://www.onmanorama.com/news/kerala.feed", type: 'rss', category: "States & Regions", region: "South", state: "Kerala", tier: "Regional", language: "en" },
  { id: 'dinamalar', name: "Dinamalar", url: "https://rss.dinamalar.com/?cat=news", type: 'rss', category: "States & Regions", region: "South", state: "Tamil Nadu", tier: "Regional", language: "ta" },
  { id: 'eenadu', name: "Eenadu", url: "https://www.eenadu.net/rss", type: 'rss', category: "States & Regions", region: "South", state: "Andhra Pradesh", tier: "Regional", language: "te" },
  { id: 'prajavani', name: "Prajavani", url: "https://www.prajavani.net/rss/karnataka.rss", type: 'rss', category: "States & Regions", region: "South", state: "Karnataka", tier: "Regional", language: "kn" },

  // North East & East Desks
  { id: 'eastmojo', name: "EastMojo", url: "https://www.eastmojo.com/feed/", type: 'rss', category: "States & Regions", region: "North East", tier: "Regional", language: "en" },
  { id: 'sentinel-assam', name: "Sentinel Assam", url: "https://www.sentinelassam.com/feed", type: 'rss', category: "States & Regions", region: "North East", state: "Assam", tier: "Regional", language: "en" },
  { id: 'shillong-times', name: "The Shillong Times", url: "https://theshillongtimes.com/feed/", type: 'rss', category: "States & Regions", region: "North East", state: "Meghalaya", tier: "Regional", language: "en" },
  { id: 'assam-tribune', name: "The Assam Tribune", url: "https://assamtribune.com/feed/", type: 'rss', category: "States & Regions", region: "North East", state: "Assam", tier: "Regional", language: "en" },
  { id: 'nagaland-post', name: "Nagaland Post", url: "https://nagalandpost.com/feed/", type: 'rss', category: "States & Regions", region: "North East", state: "Nagaland", tier: "Regional", language: "en" },
  { id: 'telegraph-india', name: "The Telegraph", url: "https://www.telegraphindia.com/rss-feed/national", type: 'rss', category: "States & Regions", region: "East", state: "West Bengal", tier: "Regional", language: "en" },
  { id: 'anandabazar', name: "Anandabazar Patrika", url: "https://www.anandabazar.com/rss", type: 'rss', category: "States & Regions", region: "East", state: "West Bengal", tier: "Regional", language: "bn" },
  { id: 'odishatv', name: "OdishaTV", url: "https://odishatv.in/feed", type: 'rss', category: "States & Regions", region: "Odisha / Tribal belt", state: "Odisha", tier: "Regional", language: "en" },
  { id: 'sambad', name: "Sambad", url: "https://sambadenglish.com/feed/", type: 'rss', category: "States & Regions", region: "Odisha / Tribal belt", state: "Odisha", tier: "Regional", language: "en" },
  { id: 'kashmir-observer', name: "Kashmir Observer", url: "https://kashmirobserver.net/feed/", type: 'rss', category: "States & Regions", region: "North", state: "Jammu and Kashmir", tier: "Regional", language: "en" },
  { id: 'greater-kashmir', name: "Greater Kashmir", url: "https://www.greaterkashmir.com/feed/", type: 'rss', category: "States & Regions", region: "North", state: "Jammu and Kashmir", tier: "Regional", language: "en" },
  
  // West & Central India Desks
  { id: 'lokmat', name: "Lokmat", url: "https://english.lokmat.com/rss", type: 'rss', category: "States & Regions", region: "West", state: "Maharashtra", tier: "Regional", language: "en" },
  { id: 'sakal', name: "Sakal", url: "https://www.esakal.com/feed", type: 'rss', category: "States & Regions", region: "West", state: "Maharashtra", tier: "Regional", language: "mr" },
  { id: 'gujarat-samachar', name: "Gujarat Samachar", url: "https://www.gujaratsamachar.com/rss", type: 'rss', category: "States & Regions", region: "West", state: "Gujarat", tier: "Regional", language: "gu" },
  { id: 'free-press-journal', name: "Free Press Journal", url: "https://www.freepressjournal.in/feed", type: 'rss', category: "States & Regions", region: "West", state: "Maharashtra", tier: "Regional", language: "en" },
  { id: 'the-hitavada', name: "The Hitavada", url: "https://www.thehitavada.com/rss", type: 'rss', category: "States & Regions", region: "Central", state: "Madhya Pradesh", tier: "Regional", language: "en" },

  // Special/Niche Desks
  { id: 'down-to-earth', name: "Down To Earth", url: "https://www.downtoearth.org.in/rss", type: 'rss', category: "Science, Climate & Tech", region: "National", tier: "National", language: "en" },
    { id: 'the-hindu-html', name: "The Hindu (HTML)", url: "https://www.thehindu.com/news/national/", type: 'html', category: "Politics & Governance", region: "National", tier: "National", language: "en" },
  { id: 'indian-express-html', name: "Indian Express (HTML)", url: "https://indianexpress.com/section/india/", type: 'html', category: "Politics & Governance", region: "National", tier: "National", language: "en" },
  { id: 'times-of-india-html', name: "Times of India (HTML)", url: "https://timesofindia.indiatimes.com/india", type: 'html', category: "National", region: "National", tier: "National", language: "en" },
  { id: 'hindustan-times-html', name: "Hindustan Times (HTML)", url: "https://www.hindustantimes.com/india-news", type: 'html', category: "National", region: "National", tier: "National", language: "en" },
  { id: 'aaj-tak-html', name: "Aaj Tak (HTML)", url: "https://www.aajtak.in/", type: 'html', category: "National", region: "National", tier: "National", language: "hi" },
  { id: 'the-news-minute-html', name: "The News Minute (HTML)", url: "https://www.thenewsminute.com/news", type: 'html', category: "States & Regions", region: "South", tier: "Regional", language: "en" }, // Fallback HTML adapter
  { id: 'eastmojo-html', name: "EastMojo (HTML)", url: "https://www.eastmojo.com/category/news/", type: 'html', category: "States & Regions", region: "North East", tier: "Regional", language: "en" } // Fallback HTML adapter
];

export const OPINION_SOURCES = ["opindia", "swarajya", "the quint", "quint", "opinion", "commentary", "editorial"];

export function isOpinionOutlet(source: string): boolean {
  const s = String(source || "").toLowerCase();
  return OPINION_SOURCES.some(n => s.includes(n));
}
