// Editorial framing from headlines and articles. Evidence-oriented, no manufactured slurs.

import { tokenize } from "./clustering.service";

const FRAMING_CATEGORIES: { tag: string; regex: RegExp; lens: string }[] = [
  { tag: "heightened rhetoric", regex: /\b(shocking|slams|blasts|explodes|outrage|havoc|furious|furore|scathing)\b/i, lens: "Heightened Conflict Rhetoric" },
  { tag: "distanced attribution", regex: /\b(alleged|claims|reportedly|may have|purported|sources claim)\b/i, lens: "Attributed Claims & Hedging" },
  { tag: "diplomatic dialogue", regex: /\b(bilateral|summit|peace talks|diplomacy|envoy|treaty|endless war|ceasefire)\b/i, lens: "Diplomatic Outreach & Global Peace Dialogue" },
  { tag: "institutional scrutiny", regex: /\b(court|bench|verdict|plea|hearing|statute|tribunal|cbi|ed|investigation|inquiry)\b/i, lens: "Legal & Institutional Scrutiny" },
  { tag: "economic metrics", regex: /\b(gdp|inflation|trade turnover|deficit|revenue|market|economy|exports)\b/i, lens: "Macroeconomic & Fiscal Metrics" },
];

function cleanSource(name: string): string {
  if (!name) return "Unknown";
  const n = name.split("|")[0].split(":")[0].trim();
  if (/^source\s+\d+/i.test(n) || n === "National Desk") return n;
  return n.replace(/\s{2,}/g, " ").slice(0, 60);
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

    let framingLens = "Straightforward Factual Dispatch";
    if (framingHits.length > 0) {
      framingLens = framingHits[0];
    } else if (omitted.length >= 4) {
      framingLens = "Selective Context Focus (omits metrics noted by peers)";
    }

    // Extract clean capitalized entities / proper nouns from title
    const stopWords = new Set(["The", "This", "That", "These", "Those", "What", "When", "Where", "With", "From", "After", "Before", "Into", "Over", "Under", "About", "Against", "Amid", "Says", "Tells", "Will"]);
    const capitalizedTokens = headline
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => /^[A-Z][a-z]{2,}$/.test(w) && !stopWords.has(w));
    const cleanEmphasized = Array.from(new Set(capitalizedTokens)).slice(0, 4).join(", ") || "Core Event Details";

    const cleanOmitted = omitted
      .filter(tok => /^[a-z]{4,}$/.test(tok) && !/^\d+$/.test(tok) && !stopWords.has(tok.charAt(0).toUpperCase() + tok.slice(1)))
      .slice(0, 3)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(", ") || "";

    return {
      source: cleanSource(art.source),
      title: art.title,
      url: art.url,
      publishedAt: art.pubDate,
      bias: "unscored",
      framingLens,
      editorialFraming: framingLens,
      narrativeSummary: art.description || art.title,
      framingStrategy: framingLens,
      keyOmissions: cleanOmitted,
      downplayed: cleanOmitted,
      emphasized: cleanEmphasized,
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

  const masterTitle = cluster.slice().sort((a, b) => (a.title?.length || 0) - (b.title?.length || 0))[0]?.title
    || cluster[0]?.title
    || "Developing story";

  // Pick the cleanest, most descriptive journalist paragraph from the cluster
  const cleanSummary = cluster.find(c => c.description && c.description.length > 30 && !c.description.includes("<") && !c.description.includes("http"))?.description
    || cluster[0]?.description
    || masterTitle;

  return {
    title: masterTitle,
    description: cleanSummary.replace(/\s+/g, ' ').trim(),
    verifiableConsensus: shared.length >= 3
      ? `Key reporting across independent desks confirms shared factual ground concerning ${masterTitle.replace(/^(watch|live|breaking|exclusive):\s*/i, '')}.`
      : "",
    narrativeLandscape: contrast,
    divergenceMap: uniqueTitles.length > 1 ? `${uniqueTitles.length} distinct headlines.` : "Little headline divergence.",
    perspectives,
  };
}

export { cleanSource };
