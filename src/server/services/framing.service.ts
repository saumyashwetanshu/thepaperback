// Editorial framing from headlines and articles. Evidence-oriented, no manufactured slurs.

import { tokenize } from "./clustering.service";

const FRAMING_CATEGORIES: { tag: string; regex: RegExp; lens: string }[] = [
  { tag: "heightened rhetoric", regex: /\b(shocking|slams|blasts|explodes|outrage|havoc|furious|furore|scathing)\b/i, lens: "Heightened Conflict Rhetoric" },
  { tag: "distanced attribution", regex: /\b(alleged|claims|reportedly|may have|purported|sources claim)\b/i, lens: "Attributed Claims & Hedging" },
  { tag: "diplomatic dialogue", regex: /\b(bilateral|summit|peace talks|diplomacy|envoy|treaty|endless war|ceasefire)\b/i, lens: "Diplomatic Outreach & Global Peace Dialogue" },
  { tag: "institutional scrutiny", regex: /\b(court|bench|verdict|plea|hearing|statute|tribunal|cbi|ed|investigation|inquiry)\b/i, lens: "Legal & Institutional Scrutiny" },
  { tag: "economic metrics", regex: /\b(gdp|inflation|trade turnover|deficit|revenue|market|economy|exports)\b/i, lens: "Macroeconomic & Fiscal Metrics" },
];

const PLACEHOLDER_TITLE =
  /this is a real headline|not ai-generated|lorem ipsum|sample headline|dummy headline/i;

function cleanSource(name: string): string {
  if (!name) return "Unknown";
  const n = name.split("|")[0].split(":")[0].trim();
  if (/^source\s+\d+/i.test(n) || n === "National Desk") return n;
  return n.replace(/\s{2,}/g, " ").slice(0, 60);
}

function titleScore(title: string): number {
  const t = String(title || "").trim();
  if (!t || PLACEHOLDER_TITLE.test(t)) return -999;
  let score = Math.min(t.length, 140);
  // Prefer specific event headlines over ultra-short stubs
  if (t.length < 28) score -= 40;
  if (t.length > 55 && t.length < 120) score += 25;
  if (/\b(collapse|killed|arrest|verdict|election|crash|flood|fire|explosion|strike|budget|summit)\b/i.test(t)) score += 15;
  if (/^live\b/i.test(t)) score -= 5;
  return score;
}

function pickMasterTitle(cluster: { title?: string; content?: string; description?: string }[]): string {
  const ranked = [...cluster].sort((a, b) => titleScore(b.title || "") - titleScore(a.title || ""));
  const best = ranked[0]?.title?.trim();
  if (best && titleScore(best) > -100) return best;
  return cluster[0]?.title?.trim() || "Developing story";
}

function narrativeFromArticle(art: { description?: string; content?: string; title?: string }): string {
  const title = String(art.title || "").trim();
  const desc = String(art.description || "").replace(/\s+/g, " ").trim();
  const content = String(art.content || "").replace(/\s+/g, " ").trim();

  const candidates = [desc, content].filter(Boolean);
  for (const c of candidates) {
    if (c.length < 48) continue;
    if (PLACEHOLDER_TITLE.test(c)) continue;
    // skip pure headline echo
    const cn = c.toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g, "");
    const tn = title.toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g, "");
    if (tn.length > 20 && (cn === tn || (cn.includes(tn) && Math.abs(cn.length - tn.length) < 24))) continue;
    const clipped = c.length > 340 ? `${c.slice(0, 337).trim()}…` : c;
    return clipped;
  }
  // First prose sentences from body
  if (content.length >= 120) {
    const paras = content.split(/(?<=[.?!])\s+/).filter((p) => p.length > 40);
    const pick = paras.slice(0, 2).join(" ").trim();
    if (pick.length >= 48) return pick.length > 340 ? `${pick.slice(0, 337).trim()}…` : pick;
  }
  return "";
}

export function analyzeClusterFraming(cluster: { source: string; title: string; url: string; pubDate?: string; description?: string; region?: string; content?: string }[]) {
  const titles = cluster.map(c => c.title || "");
  const bodies = cluster.map(c => `${c.description || ""} ${c.content || ""}`);
  const tokenSets = bodies.map(t => new Set(tokenize(t)));
  const allTokens = new Set<string>();
  tokenSets.forEach(s => s.forEach(t => allTokens.add(t)));

  const perspectives = cluster.map((art, i) => {
    const mine = tokenSets[i];
    const omitted: string[] = [];
    for (const tok of allTokens) {
      const inOthers = tokenSets.some((s, j) => j !== i && s.has(tok));
      if (inOthers && !mine.has(tok) && tok.length > 4) omitted.push(tok);
    }
    
    const framingHits: string[] = [];
    const headline = art.title || "";
    for (const cat of FRAMING_CATEGORIES) {
      if (cat.regex.test(headline)) {
        framingHits.push(cat.lens);
      }
    }

    let framingLens = "";
    if (framingHits.length > 0) {
      framingLens = framingHits[0];
    }

    const stopWords = new Set(["The", "This", "That", "These", "Those", "What", "When", "Where", "With", "From", "After", "Before", "Into", "Over", "Under", "About", "Against", "Amid", "Says", "Tells", "Will"]);
    const capitalizedTokens = headline
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => /^[A-Z][a-z]{2,}$/.test(w) && !stopWords.has(w));
    const cleanEmphasized = Array.from(new Set(capitalizedTokens)).slice(0, 4).join(", ") || "";

    const cleanOmitted = omitted
      .filter(tok => /^[a-z]{4,}$/.test(tok) && !/^\d+$/.test(tok) && !stopWords.has(tok.charAt(0).toUpperCase() + tok.slice(1)))
      .slice(0, 3)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(", ") || "";

    const summary = narrativeFromArticle(art);

    return {
      source: cleanSource(art.source),
      title: art.title,
      url: art.url,
      publishedAt: art.pubDate,
      bias: "unscored",
      framingLens: framingLens || undefined,
      editorialFraming: framingLens || undefined,
      narrativeSummary: summary,
      leadParagraph: summary,
      framingStrategy: framingLens || undefined,
      keyOmissions: cleanOmitted || undefined,
      downplayed: cleanOmitted || undefined,
      emphasized: cleanEmphasized || undefined,
      content: art.content || undefined,
      sourceIntegrity: "Standard" as const,
      confidenceScore: 60,
      reliability: "mixed" as const,
    };
  });

  const shared: string[] = [];
  for (const tok of allTokens) {
    const count = tokenSets.filter(s => s.has(tok)).length;
    if (count >= Math.max(2, Math.ceil(cluster.length * 0.5))) shared.push(tok);
  }

  const uniqueTitles = Array.from(new Set(titles.filter(Boolean)));
  const contrast = uniqueTitles.length >= 2
    ? uniqueTitles.slice(0, 3).map(t => `"${t}"`).join(" vs ")
    : (uniqueTitles[0] ? `Headlines largely agree: "${uniqueTitles[0]}"` : "Headlines largely agree.");

  const masterTitle = pickMasterTitle(cluster);

  const cleanSummary =
    cluster
      .map((c) => narrativeFromArticle(c))
      .find((s) => s.length >= 48) ||
    cluster.find(c => c.description && c.description.length > 30 && !c.description.includes("<") && !c.description.includes("http"))?.description ||
    masterTitle;

  return {
    title: masterTitle,
    description: String(cleanSummary).replace(/\s+/g, ' ').trim(),
    verifiableConsensus: shared.length >= 3
      ? `Shared terms across desks include: ${shared.slice(0, 8).join(", ")}.`
      : "",
    narrativeLandscape: contrast,
    divergenceMap: uniqueTitles.length > 1 ? `${uniqueTitles.length} distinct headlines.` : "Little headline divergence.",
    perspectives,
  };
}

export { cleanSource };
