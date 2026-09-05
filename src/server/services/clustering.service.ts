// Clustering prefers full EXTRACTED bodies + MiniLM embeddings (embed.minilm.ts).
// Headline TF-IDF (title_cluster_distance / pairwiseSimilarity) is fallback when bodies are missing.
// No Gemini in this module.

const STOP = new Set([
  "the","a","an","and","or","of","to","in","on","for","with","at","by","from","as","is","are","was","were","be","been",
  "after","over","under","into","about","says","said","amid","as","new","india","indian","govt","government",
  "breaking","watch","live","update","exclusive"
]);

// Import enhanced NLP services
import { extractEntitiesDetailed, extractEntitiesFlattened } from "./nlp/entity.service";
import { detectLanguage, getStopwordsForLanguage, isDevanagariHeavy, isMostlyLatinScript } from "./nlp/language.service";
export { isDevanagariHeavy, isMostlyLatinScript } from "./nlp/language.service";

const JUNK_TITLE_RE = /gold rate today|silver rate|gold rate|petrol price|diesel price|petrol rate|diesel rate|teer result|\bteer\b|horoscope|rashifal|राशिफल|raksha bandhan|rakhi|train time|amrit bharat express route|cricket score|cricket association|hockey wc|wtc standing|\bipl\b|ipl scorecard|scorecard|fantasy|weather today in|lucky number|\bfc\b|football|video goes viral|viral video|calculator|tax calculator|income tax calculator|सोना|सोने की कीमत|सोने का भाव|चांदी का भाव|इनकम टैक्स कैलकुलेटर|कैलकुलेटर|baking at home|baking for beginners|\brecipe\b|crossword|sudoku|watch live|live score|stock price|stock tip|stock tips|share tip|share tips|epaper|e-paper|photo gallery|how to (file|calculate|check|use|make|apply)|ताजा समाचार|लाइव ब्रेकिंग|मुख्य और ताजा|पढ़ें .{0,12}के मुख्य|शेयर टिप्स|फैंटेसी|क्रिकेट स्कोर|फोटो गैलरी|ई-पेपर|ईपेपर|टीयर रिजल्ट/i;

export function isJunkTitle(title: string): boolean {
  return JUNK_TITLE_RE.test(String(title || ""));
}

/** Homepage rails: English-first — no junk, no Devanagari-heavy titles, Latin/English preferred. */
export function isHomepageEligible(story: { title?: string; description?: string; language?: string } | null | undefined): boolean {
  if (!story) return false;
  const title = String(story.title || "").trim();
  if (!title) return false;
  if (isJunkTitle(title)) return false;

  const description = String(story.description || "");
  const scriptText = `${title} ${description}`.trim();
  if (isDevanagariHeavy(title) || isDevanagariHeavy(scriptText, 0.35)) return false;

  const lang = String(story.language || "").trim().toLowerCase();
  if (lang === "en" || lang === "english") return true;

  // Prefer explicit language when present; also allow Latin-script English headlines
  // even if the language field is missing or mis-tagged.
  if (!isDevanagariHeavy(title) && isMostlyLatinScript(title)) return true;

  return false;
}

export function normalizeTitle(title: string): string {
  return String(title || "")
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/^(breaking|live|update|watch|exclusive|just in)[:\-\s]+/i, "")
    .replace(/\s*[\|\-–—]\s*(the hindu|indian express|times of india|hindustan times|ndtv|news18|zee news|abp|india today|opindia|swarajya|the quint|eastmojo|sentinel assam).*$/i, "")
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  const lang = detectLanguage(text).language;
  const stop = getStopwordsForLanguage(lang);
  return normalizeTitle(text)
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP.has(t) && !stop.has(t));
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
}

function hasWord(hay: string, phrase: string): boolean {
  if (!phrase) return false;
  return new RegExp(`\\b${escapeRe(phrase)}\\b`, "i").test(hay);
}

const NE_KEYS = [
  "assam","manipur","meghalaya","mizoram","nagaland","tripura","arunachal pradesh","arunachal",
  "sikkim","northeast","north-east","north east","guwahati","imphal","kohima","aizawl","itanagar",
  "agartala","shillong","dimapur","kangpokpi","ukhrul","churachandpur","tawang","pasighat","aizawl"
];

const TRIBAL_KEYS = [
  "bastar","dantewada","santal","santhal","adivasi","tribal","naxal","sukma","kalahandi",
  "koraput","mayurbhanj","malkangiri","kandhamal","sundargarh","keonjhar","gadchiroli",
  "tribal artisan","tribal belt"
];

const STATE_KEYS: [string, string][] = [
  ["uttar pradesh","Uttar Pradesh"],["uttarakhand","Uttarakhand"],["madhya pradesh","Madhya Pradesh"],
  ["andhra pradesh","Andhra Pradesh"],["arunachal pradesh","Arunachal Pradesh"],["arunachal","Arunachal Pradesh"],
  ["himachal pradesh","Himachal Pradesh"],["himachal","Himachal Pradesh"],
  ["west bengal","West Bengal"],["tamil nadu","Tamil Nadu"],["jammu and kashmir","Jammu & Kashmir"],
  ["jammu & kashmir","Jammu & Kashmir"],["kashmir","Jammu & Kashmir"],
  ["karnataka","Karnataka"],["kerala","Kerala"],["gujarat","Gujarat"],["maharashtra","Maharashtra"],
  ["punjab","Punjab"],["haryana","Haryana"],["rajasthan","Rajasthan"],["bihar","Bihar"],
  ["jharkhand","Jharkhand"],["odisha","Odisha"],["orissa","Odisha"],["assam","Assam"],
  ["manipur","Manipur"],["meghalaya","Meghalaya"],["mizoram","Mizoram"],["nagaland","Nagaland"],
  ["tripura","Tripura"],["sikkim","Sikkim"],["goa","Goa"],["delhi","Delhi"],["new delhi","Delhi"],
  ["telangana","Telangana"],["chhattisgarh","Chhattisgarh"],["ladakh","Ladakh"],["puducherry","Puducherry"],
  ["kanpur","Uttar Pradesh"],["lucknow","Uttar Pradesh"],["patna","Bihar"],["ranchi","Jharkhand"],
  ["jamshedpur","Jharkhand"],["raipur","Chhattisgarh"],["bhubaneswar","Odisha"],["guwahati","Assam"],
  ["imphal","Manipur"],["shillong","Meghalaya"],["kohima","Nagaland"],["aizawl","Mizoram"],
  ["itanagar","Arunachal Pradesh"],["agartala","Tripura"],["dimapur","Nagaland"]
];

const REGIONAL_SOURCES = [
  "eastmojo","shillong times","northeast now","nenow","morung","imphal free press","imphal times",
  "arunachal times","sentinel assam","nagaland post","nagaland tribune","eastern mirror",
  "sangai express","highland post","ukhrul times","hills times","the hills times","odishatv",
  "odisha tv","odishaTV"
];

export function isRegionalDesk(source: string): boolean {
  const s = String(source || "").toLowerCase();
  return REGIONAL_SOURCES.some(r => s.includes(r.toLowerCase()));
}

/** Geography from TITLE+DESCRIPTION only. Never from an outlet's RSS region field. Word-boundary so kanpur ≠ karnataka. */
export function inferStoryRegion(title: string, description = ""): string | null {
  const hay = `${title || ""} ${description || ""}`.toLowerCase();
  if (!hay.trim()) return null;
  if (NE_KEYS.some(k => hasWord(hay, k))) return "North East";
  if (TRIBAL_KEYS.some(k => hasWord(hay, k))) return "Tribal belt";
  for (const [key, label] of STATE_KEYS) {
    if (hasWord(hay, key)) return label;
  }
  return null;
}

export function isNeOrTribalGeo(title: string, description = ""): boolean {
  const r = inferStoryRegion(title, description);
  return r === "North East" || r === "Tribal belt";
}

function jaccard_similarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  let inter = 0;
  for (const x of setA) if (setB.has(x)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

export async function get_text_embedding(text: string): Promise<number[]> {
  const { embedHeadline } = await import("./embed.minilm");
  return embedHeadline(text);
}

export function cluster_distance(
  article: any, member: any
): number {
  const bodyA = String(article?.content || "");
  const bodyB = String(member?.content || "");
  const extractedA = article?.extractionStatus === "EXTRACTED" && bodyA.length >= 500;
  const extractedB = member?.extractionStatus === "EXTRACTED" && bodyB.length >= 500;

  const timeA = new Date(article.pubDate || Date.now()).getTime();
  const timeB = new Date(member.pubDate || Date.now()).getTime();

  // Fallback: headline TF-IDF when either side lacks a full EXTRACTED body.
  if (!extractedA || !extractedB) {
    return title_cluster_distance(
      String(article?.title || ""),
      String(member?.title || ""),
      timeA,
      timeB
    );
  }

  const embA = article.embedding;
  const embB = member.embedding;

  const entA = article.entities || [];
  const entB = member.entities || [];

  // Prefer MiniLM (or hashed) embeddings on full bodies; TF-IDF body overlap if vectors missing/mismatched.
  let d_sem = 1 - pairwiseSimilarity(bodyA, bodyB);
  try {
    if (embA && embB && embA.length >= 8 && embA.length === embB.length) {
      d_sem = 1 - cosine_similarity(embA, embB);
    }
  } catch {
    // Keep body TF-IDF distance if embedding compare fails.
  }
  
  // Fast reject if completely semantically different (Threshold 0.48 determined by ablation benchmark)
  if (d_sem > 0.48) {
      return 1.0; 
  }

  // HARD CONFLICT 1: Numeric/Monetary/Percentage conflict
  const numA = bodyA.match(/\d+(?:\.\d+)?/g) || [];
  const numB = bodyB.match(/\d+(?:\.\d+)?/g) || [];
  if (numA.length > 0 && numB.length > 0) {
     const numJ = jaccard_similarity(new Set(numA), new Set(numB));
     if (numJ === 0) return 1.0; 
  }
  
  // HARD CONFLICT 2: Opposing Predicates/Actions
  const opposites = [
    ["cuts", "raises"], ["wins", "loses"], ["passed", "rejected"], 
    ["up", "down"], ["increases", "decreases"], ["hikes", "cuts"],
    ["approves", "rejects"], ["acquires", "sells"], ["arrests", "releases"],
    ["signs", "cancels"], ["launches", "withdraws"]
  ];
  const tA = bodyA.toLowerCase();
  const tB = bodyB.toLowerCase();
  for (const [w1, w2] of opposites) {
      if ((hasWord(tA, w1) && hasWord(tB, w2)) || (hasWord(tA, w2) && hasWord(tB, w1))) {
         return 1.0;
      }
  }

  // HARD CONFLICT 3: Core Entity Conflict
  const normEntA = entA.map((e: any) => (e.normalized || e.text || e).toLowerCase());
  const normEntB = entB.map((e: any) => (e.normalized || e.text || e).toLowerCase());
  if (normEntA.length > 0 && normEntB.length > 0) {
      if (jaccard_similarity(new Set(normEntA), new Set(normEntB)) === 0) {
          return 1.0;
      }
  }
  
  // HARD CONFLICT 4: Temporal conflict (decay)
  const MAX_TIME_DIFF_MS = 48 * 60 * 60 * 1000;
  const timeDiff = Math.abs(timeA - timeB);
  if (timeDiff > MAX_TIME_DIFF_MS) {
      return 1.0;
  }
  
  return d_sem;
}

export async function extract_entities_and_predicate(text: string): Promise<{
  entities: string[];
  predicate: string;
  geoOrigin: string;
  publisherTier: string;
}> {
  // Use detailed entity extraction for better structure
  const detailedEntities = await extractEntitiesDetailed(text);

  // Convert to flattened string array for backward compatibility with caching layer
  const entities = extractEntitiesFlattened(detailedEntities);

  const geo = inferStoryRegion(text, "") || "National";
  // Compute tokens for predicate (existing logic)
  const predicateTokens = tokenize(text);
  return {
    entities,
    predicate: predicateTokens.slice(0, 4).join(" "), // Keep existing predicate logic
    geoOrigin: geo,
    publisherTier: geo === "North East" || geo === "Tribal belt" ? "Regional" : "National",
  };
}


type SparseVec = Map<string, number>;

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  const n = tokens.length || 1;
  for (const [k, v] of tf) tf.set(k, v / n);
  return tf;
}

function computeIdf(docs: string[][]): Map<string, number> {
  const df = new Map<string, number>();
  const n = docs.length || 1;
  for (const tokens of docs) {
    for (const t of new Set(tokens)) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const idf = new Map<string, number>();
  for (const [term, count] of df) {
    idf.set(term, Math.log((n + 1) / (count + 1)) + 1);
  }
  return idf;
}

function tfidfVector(tokens: string[], idf: Map<string, number>): SparseVec {
  const tf = termFrequency(tokens);
  const vec: SparseVec = new Map();
  for (const [term, freq] of tf) {
    vec.set(term, freq * (idf.get(term) ?? 1));
  }
  return vec;
}

function sparseCosine(a: SparseVec, b: SparseVec): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
  for (const [k, v] of smaller) {
    const w = larger.get(k);
    if (w) dot += v * w;
  }
  for (const v of a.values()) na += v * v;
  for (const v of b.values()) nb += v * v;
  if (na === 0 || nb === 0) return 0;
  const sim = dot / (Math.sqrt(na) * Math.sqrt(nb));
  return sim > 1 ? 1 : sim < 0 ? 0 : sim;
}

/** TF-IDF cosine of two texts (bodies preferred; also used for headline fallback). */
export function pairwiseSimilarity(a: string, b: string): number {
  const docs = [tokenize(a), tokenize(b)];
  const idf = computeIdf(docs);
  return sparseCosine(tfidfVector(docs[0], idf), tfidfVector(docs[1], idf));
}

function cosine_similarity(a: number[], b: number[]): number {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  const sim = dot / (Math.sqrt(na) * Math.sqrt(nb));
  return sim > 1 ? 1 : sim < 0 ? 0 : sim;
}

const MAX_TIME_DIFF_MS = 48 * 60 * 60 * 1000;

export function title_cluster_distance(titleA: string, titleB: string, timeA: number = 0, timeB: number = 0): number {
  const na = normalizeTitle(titleA);
  const nb = normalizeTitle(titleB);
  if (na && na === nb) return 0;
  const d_sem = 1 - pairwiseSimilarity(titleA, titleB);
  const timeDiff = Math.abs((timeA || 0) - (timeB || 0));
  const d_time = Math.min(1, timeDiff / MAX_TIME_DIFF_MS);
  return 0.85 * d_sem + 0.15 * d_time;
}

function calculate_tripartite_distance(
  _embA: number[], _embB: number[],
  entA: string[], entB: string[],
  predA: string, predB: string,
  timeA: number, timeB: number
): number {
  const d_ent = 1 - jaccard_similarity(new Set(entA || []), new Set(entB || []));
  const predJ = jaccard_similarity(new Set((predA || "").split(" ").filter(Boolean)), new Set((predB || "").split(" ").filter(Boolean)));
  const d_pred = 1 - predJ;
  const timeDiff = Math.abs((timeA || 0) - (timeB || 0));
  const d_time = Math.min(1, timeDiff / MAX_TIME_DIFF_MS);
  return 0.55 * d_ent + 0.30 * d_pred + 0.15 * d_time;
}

// Same event if distance is under this. Body+MiniLM when both EXTRACTED; else headline TF-IDF.
export const CLUSTERING_THRESHOLD = 0.48;
