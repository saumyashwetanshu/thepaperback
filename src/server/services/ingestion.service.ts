import "dotenv/config";
import crypto from "crypto";
import dbPromise from "../../utils/db";
import { 
  saveNewsData, 
  getAiCache, 
  setAiCache, 
  getStorySynthesisCache, 
  setStorySynthesisCache, 
  getActiveStoriesForClustering,
  reactivateRecentStories,
  archiveStaleStories
} from "../../utils/dbOperations";
import { NewsStory, LiveWireItem } from "../../types";
import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey, getGeminiClient } from "./secrets.service";
import { generateContentWithFallback } from "./gemini.service";
import {
  get_text_embedding,
  extract_entities_and_predicate,
  title_cluster_distance,
  cluster_distance,
  CLUSTERING_THRESHOLD,
  isJunkTitle,
  inferStoryRegion,
  isNeOrTribalGeo,
  isRegionalDesk,
} from "./clustering.service";
import { analyzeClusterFraming } from "./framing.service";
import {
  compute_minhash_signature,
  query_lsh_wire_index,
  add_to_wire_index,
  get_ownership_group,
  calculate_jaccard_overlap
} from "./syndication.service";
import { RSS_FEEDS, fetchRssFeed, isOpinionOutlet, RawArticle, fetchAllSources } from "./scraper.service";
import { extractArticleContent } from "./ingestion/extractor";
import { detectLanguage } from "./nlp/language.service";
import { extractTemporalSignals } from "./nlp/temporal.service";

async function getAi() {
  // Prefer Secret Manager / env via secrets.service (local .env still works).
  return getGeminiClient();
}
// Eager warm for routes that still check ai || await getGeminiClient().
export let ai: any = null;
getGeminiClient().then((c) => { ai = c; }).catch(() => { ai = null; });

// Sanitize user input for safe inclusion in AI prompts to prevent prompt injection
export function sanitizeForPrompt(input: string, maxLength = 2000): string {
  if (!input) return "";
  if (input.length > maxLength) {
    input = input.substring(0, maxLength) + '... [truncated]';
  }
  // Escape backticks and dollar signs to prevent breaking template literals
  return input.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function pLimit(concurrency: number) {
    let active = 0;
    const queue: (() => void)[] = [];
    return async function <T>(fn: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const run = async () => {
                active++;
                try {
                    resolve(await fn());
                } catch (e) {
                    reject(e);
                } finally {
                    active--;
                    if (queue.length > 0) {
                        const next = queue.shift();
                        if (next) next();
                    }
                }
            };
            if (active < concurrency) {
                run();
            } else {
                queue.push(run);
            }
        });
    };
}


const MIN_EXTRACTED_BODY = 500;

function isFullyExtracted(art: any): boolean {
  return art?.extractionStatus === "EXTRACTED" && String(art?.content || "").length >= MIN_EXTRACTED_BODY;
}

function demoteFakeExtracted(status: any, content: string): string {
  const bodyLen = String(content || "").length;
  const raw = String(status || "") || "FAILED";
  // Never keep EXTRACTED without a long body â€” failed/short extracts must stay off NLP.
  if (raw === "EXTRACTED" && bodyLen < MIN_EXTRACTED_BODY) {
    return bodyLen >= 150 ? "PARTIAL" : "FAILED";
  }
  return raw;
}

async function fillExtractedBody(art: any): Promise<void> {
  if (isFullyExtracted(art)) return;
  if (!art?.url) {
    art.extractionStatus = demoteFakeExtracted(art.extractionStatus || "FAILED", art.content || "");
    if (!art.extractionStatus) art.extractionStatus = "FAILED";
    return;
  }
  try {
    const res = await extractArticleContent(art.url);
    art.content = res.text || "";
    art.extractionStatus = demoteFakeExtracted(res.status || "FAILED", art.content);
    art.canonicalUrl = res.canonicalUrl || art.url;
  } catch {
    art.content = art.content || "";
    art.extractionStatus = "FAILED";
  }
}

// 1. Breadth: Based on unique, non-wire ownership groups
function calculateBreadth(articles: any[]): number {
  const uniqueOwners = new Set(
    articles.filter(a => !a.isWire).map(a => a.ownershipGroup || a.source)
  );
  return Math.min(1.0, uniqueOwners.size / 15);
}

// 2. Velocity: Based on arrival rate in the last 3 hours
function calculateVelocity(articles: any[]): number {
  const threeHoursAgo = Date.now() - (3 * 60 * 60 * 1000);
  const recentArticles = articles.filter(a => new Date(a.pubDate).getTime() > threeHoursAgo);
  return Math.min(1.0, recentArticles.length / 10);
}

// 3. Regional Gap: Ratio of regional/local to national reporting
function calculateRegionalGap(articles: any[]): number {
  const regionalCount = articles.filter(a => a.publisherTier === 'Regional' || a.publisherTier === 'Local').length;
  const nationalCount = articles.filter(a => a.publisherTier === 'National').length;
  return Math.min(1.0, (regionalCount * 1.5) / Math.max(1, nationalCount));
}

// 4. Temporal Decay: True 24-hour exponential half-life
function calculateTimeDecay(lastUpdatedAt: Date): number {
  const hoursSinceUpdate = (Date.now() - lastUpdatedAt.getTime()) / (1000 * 60 * 60);
  return Math.pow(2, -hoursSinceUpdate / 24);
}

// 5. Final Normalized Importance Score (0.0 to 100.0)
function calculateClusterImportance(cluster: any[], n_eff: number): {
  importanceScore: number;
  breadthScore: number;
  velocityScore: number;
  regionalGapScore: number;
  impactScore: number;
  divergenceScore: number;
} {
  const breadth = calculateBreadth(cluster);
  const velocity = calculateVelocity(cluster);
  const regionalGap = calculateRegionalGap(cluster);
  
  const times = cluster.map(c => new Date(c.pubDate).getTime());
  const maxTime = Math.max(...times);
  const timeDecay = calculateTimeDecay(new Date(maxTime));
  
  const impact = Math.min(5, Math.max(1, n_eff)) / 5; // Normalize 1-5 to 0-1
  const uniqHeadlines = new Set(cluster.map(c => (c.title || '').trim().toLowerCase()));
  const divergence = Math.min(1, Math.max(0, (uniqHeadlines.size - 1) / Math.max(1, cluster.length - 1)));

  const rawImportance = (
    (0.30 * impact) +
    (0.25 * breadth) +
    (0.20 * velocity) +
    (0.15 * divergence) +
    (0.10 * regionalGap)
  ) * timeDecay;

  return {
    importanceScore: Math.round(rawImportance * 100),
    breadthScore: Math.round(breadth * 100),
    velocityScore: Math.round(velocity * 100),
    regionalGapScore: Math.round(regionalGap * 100),
    impactScore: Math.round(impact * 100),
    divergenceScore: Math.round(divergence * 100)
  };
}

async function seedPulseFromOpinion(articles: RawArticle[]): Promise<void> {
  try {
    const db = await dbPromise;
    const opinion = articles.filter(a => isOpinionOutlet(a.source) && a.title && a.url);
    for (const art of opinion) {
      try {
        const dup = await db.get(
          `SELECT id FROM pulse_posts WHERE title = ? OR (sourcesCited LIKE ?)`,
          [art.title, `%${art.url}%`]
        );
        if (dup) continue;
        const id = `pulse-seed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const body = (art.description || art.title || "").slice(0, 1200);
        const summary = body.slice(0, 280);
        const content = `${body}\n\nThis item is labeled opinion/commentary from ${art.source}. It is not a Paperback news report. Read the original before treating any line as fact.`;
        await db.run(
          'INSERT INTO pulse_posts (id, title, category, summary, content, authorId, authorName, authorRole, authorAvatar, sourcesCited, readingTimeMinutes, upvotes, hasUpvoted, publishedAt, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            id,
            art.title,
            "Opinion",
            summary,
            content,
            null,
            art.source,
            "Labeled opinion desk",
            String(art.source || "OP").slice(0, 2).toUpperCase(),
            JSON.stringify([{ title: art.title, url: art.url }]),
            2,
            0,
            0,
            art.pubDate || new Date().toISOString(),
            JSON.stringify(["Opinion", art.source])
          ]
        );
      } catch (inner) {
        console.warn("Pulse seed row skipped:", inner);
      }
    }
  } catch (e) {
    console.warn("Pulse seed skipped:", e);
  }
}

// Local pipeline for a single story cluster. Reuses pre-scraped article bodies.
async function processClusterWithAI(candidate: any, index: number): Promise<NewsStory | null> {
  const cluster: RawArticle[] = candidate.cluster;
  if (!cluster?.length) return null;
  console.log(`[local] Processing story ${index + 1} (${cluster.length} outlets): ${cluster[0].title}`);

  const extractLimit = pLimit(6);
  await Promise.all(cluster.map((art) => extractLimit(async () => {
    await fillExtractedBody(art);
  })));

  const extractedMembers = cluster.filter(isFullyExtracted);
  if (!extractedMembers.length) {
    console.log(`[local] Story ${index + 1} skipped: zero EXTRACTED full bodies`);
    return null;
  }
  const scrapedN = extractedMembers.length;

  const framed = analyzeClusterFraming(extractedMembers);
  const scores = candidate;
  const inferredRegion = inferStoryRegion(framed.title, cluster[0].description || "")
    || inferStoryRegion(cluster[0].title, cluster[0].description || "");
  const geoCat = inferredRegion && inferredRegion !== "National" ? "States & Regions" : (cluster[0].category || "News");

  // Dynamic Language Detection: Stop hardcoding "English"
  const rawLangCode = detectLanguage(extractedMembers.map((c: any) => String(c.content || "")).join("\n")).language || (extractedMembers[0] as any)?.language;
  const langNameMap: Record<string, string> = {
    'hi': 'Hindi',
    'bn': 'Bengali',
    'ta': 'Tamil',
    'te': 'Telugu',
    'mr': 'Marathi',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'en': 'English'
  };
  const storyLanguage = langNameMap[rawLangCode] || rawLangCode || "und";

  // Attach extractionStatus to each perspective
  const enrichedPerspectives = framed.perspectives.map((p: any, idx: number) => {
    const matchingArt = cluster[idx] || cluster.find((c: any) => c.source === p.source);
    // Only stamp EXTRACTED when the extract ladder succeeded with a long body.
    const rawStatus = (matchingArt as any)?.extractionStatus;
    const bodyLen = String((matchingArt as any)?.content || "").length;
    const extractionStatus =
      rawStatus === "EXTRACTED" && bodyLen >= MIN_EXTRACTED_BODY
        ? "EXTRACTED"
        : (rawStatus && rawStatus !== "EXTRACTED" ? rawStatus : (bodyLen >= MIN_EXTRACTED_BODY ? "PARTIAL" : "FAILED"));
    return {
      ...p,
      extractionStatus
    };
  });

  // Base story using heuristics
  const story: any = {
    id: (cluster as any).existingId || `story-${Date.now()}-${index}`,
    title: framed.title,
    category: geoCat,
    institution: "Media Desk",
    date: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    description: framed.description,
    perspectives: enrichedPerspectives as any,
    verifiableConsensus: framed.verifiableConsensus,
    narrativeLandscape: framed.narrativeLandscape,
    divergenceMap: framed.divergenceMap,
    blindspot: "",
    evidenceTrail: `Compared ${framed.perspectives.length} outlets. Read ${scrapedN} full articles.`,
    primaryReportingOutlet: cluster[0].source,
    language: storyLanguage,
    region: inferredRegion || "National",
    timeline: [{ date: "Today", title: "Initial reporting", description: "Event reported across outlets.", verified: true }],
    dataAudit: [],
    importanceScore: scores.importanceScore || 0,
    breadthScore: scores.breadthScore || 0,
    velocityScore: scores.velocityScore || 0,
    impactScore: scores.impactScore || 0,
    divergenceScore: scores.divergenceScore || 0,
    sourceCount: cluster.length,
  };

  // Check if Gemini enhancement is appropriate
  const shouldCallGemini = Boolean(
    ai && 
    scrapedN > 0 && 
    ((candidate.n_eff >= 2) || (index < 8) || (candidate.importanceScore >= 15))
  );

  if (shouldCallGemini) {
    try {
      // 1. Build enriched NLP context incorporating pre-extracted entities and temporal signals
      const contextBlocks = extractedMembers.map((c: any) => {
        const entities = Array.isArray(c.entities) && c.entities.length > 0 
          ? c.entities.slice(0, 12).join(", ") 
          : "None logged";
        const dates = Array.isArray(c.temporalSignals) && c.temporalSignals.length > 0
          ? c.temporalSignals.map((t: any) => t.normalized || t.text).slice(0, 5).join(", ")
          : "Recent event";
        const ownership = c.ownershipGroup ? ` (Ownership: ${c.ownershipGroup})` : "";
        const reportingType = c.isWire ? "[SYNDICATED WIRE FEED]" : "[ORIGINAL DESK REPORTING]";

        return `Outlet: ${sanitizeForPrompt(c.source)}${ownership} ${reportingType}
Headline: ${sanitizeForPrompt(c.title)}
Key Entities Detected (NLP): ${entities}
Temporal Anchors (NLP): ${dates}
Article Content Excerpt:
${sanitizeForPrompt(String(c.content || "").slice(0, 8000), 8000)}`;
      });

      const context = contextBlocks.join("\n\n====================\n\n");
      const crossDeskTokens = framed.verifiableConsensus 
        ? `\nShared vocabulary note (token overlap only â€” not verified facts): ${framed.verifiableConsensus}` 
        : "";

      // 2. Deterministic Hash Caching via SQLite
      const clusterHash = crypto.createHash("sha256").update(`cluster-ai-${context}`).digest("hex");
      const cachedAi = await getStorySynthesisCache(clusterHash);

      if (cachedAi && cachedAi.summary) {
        console.log(`[ai] Cache hit for story cluster ${index + 1} (${clusterHash.slice(0, 8)})`);
        story.description = cachedAi.summary;
        if (cachedAi.verifiableConsensus) story.verifiableConsensus = cachedAi.verifiableConsensus;
        if (cachedAi.narrativeLandscape) story.narrativeLandscape = cachedAi.narrativeLandscape;
        if (cachedAi.narrativeDetails) story.narrativeDetails = cachedAi.narrativeDetails;
        if (Array.isArray(cachedAi.timeline) && cachedAi.timeline.length > 0) {
          story.timeline = cachedAi.timeline.map((t: any) => ({ ...t, date: String(t.date || "") }));
        }
        if (Array.isArray(cachedAi.perspectives) && cachedAi.perspectives.length > 0) {
          story.perspectives = story.perspectives.map((p: any) => {
            const aiPersp = cachedAi.perspectives.find((ap: any) => ap.source === p.source);
            return aiPersp ? { ...p, ...aiPersp } : p;
          });
        }
        story.evidenceTrail += " AI Enhanced (Cached).";
        return story;
      }

      // 3. Sequential Pacing Delay (1200ms) to strictly prevent 429 quota exhaustion
      await new Promise((res) => setTimeout(res, 1200));

      console.log(`[ai] Enhancing story cluster ${index + 1} with Gemini (NLP-synchronized)...`);

      const prompt = `You are a Senior Investigative News Editor and Media Literacy Analyst at The Paperback.
Analyze the following reporting from ${extractedMembers.length} newsrooms covering this event.${crossDeskTokens}

TRUTH RULES (non-negotiable):
- ONLY use facts present in the Article Content Excerpt blocks below. Those are full-article extracts.
- NEVER invent facts, numbers, quotes, desks, places, or timelines not present in the provided excerpts.
- If evidence is thin: say so, write NEEDS CONTEXT, or omit the claim â€” do NOT fill gaps with model knowledge.
- Do not treat "Shared vocabulary note" as verified facts; it is token overlap only.

Strict Editorial Directives:
1. Objectivity: Present unvarnished, factual truth. Avoid partisan framing or speculation.
2. Cross-Desk Framing: Explicitly contrast how each newsroom frames the development. State which data points or angles one desk emphasized and what peer desks omitted.
3. Grounding: Ground the timeline strictly in dates and event sequences that appear in the excerpts.
4. Distinguish Claims: Separate multi-desk agreement (same fact in multiple excerpts) from single-source claims. If only one excerpt supports a point, say so.

Reporting to Analyze:
${context}`;

      const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";

      const response = await generateContentWithFallback(ai, {
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              summary: {
                type: "STRING",
                description: "A highly condensed, factual briefing of what happened (1-2 punchy paragraphs, max 100 words). Strictly objective and forensic."
              },
              verifiableConsensus: {
                type: "STRING",
                description: "Bulleted string (separated by newline) of the core undisputed facts verified across all provided newsrooms."
              },
              narrativeLandscape: {
                type: "STRING",
                description: "Editorial synthesis explaining how outlets frame this differently and key points of contrast."
              },
              narrativeDetails: {
                type: "OBJECT",
                properties: {
                  mainstreamVsIndependent: { type: "STRING" },
                  regionalVsNational: { type: "STRING" },
                  keyOmissions: { type: "STRING" }
                }
              },
              timeline: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    date: { type: "STRING" },
                    title: { type: "STRING" },
                    description: { type: "STRING" },
                    verified: { type: "BOOLEAN" }
                  },
                  required: ["date", "title", "description"]
                }
              },
              perspectives: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    source: { type: "STRING" },
                    bias: { type: "STRING" },
                    sourceIntegrity: { type: "STRING" },
                    confidenceScore: { type: "INTEGER" },
                    narrativeSummary: { type: "STRING" },
                    framingLens: { type: "STRING" }
                  },
                  required: ["source", "narrativeSummary", "framingLens"]
                }
              }
            },
            required: ["summary", "verifiableConsensus", "narrativeLandscape", "perspectives"]
          }
        }
      });

      if (response.text) {
        let text = response.text.trim();
        if (text.startsWith("```json")) text = text.substring(7);
        if (text.startsWith("```")) text = text.substring(3);
        if (text.endsWith("```")) text = text.substring(0, text.length - 3);

        const parsed = JSON.parse(text);
        if (parsed.summary) story.description = parsed.summary;
        if (parsed.verifiableConsensus) story.verifiableConsensus = parsed.verifiableConsensus;
        if (parsed.narrativeLandscape) story.narrativeLandscape = parsed.narrativeLandscape;
        if (parsed.narrativeDetails) story.narrativeDetails = parsed.narrativeDetails;
        if (parsed.timeline && Array.isArray(parsed.timeline) && parsed.timeline.length > 0) {
          story.timeline = parsed.timeline.map((t: any) => ({ ...t, date: String(t.date || "") }));
        }
        if (parsed.perspectives && Array.isArray(parsed.perspectives)) {
          story.perspectives = story.perspectives.map((p: any) => {
            const aiPersp = parsed.perspectives.find((ap: any) => ap.source === p.source);
            if (aiPersp) {
              return { ...p, ...aiPersp };
            }
            return p;
          });
        }
        story.evidenceTrail += " AI Enhanced (Synchronized).";

        // Save into SQLite cache so this cluster never consumes API quota again
        await setStorySynthesisCache(clusterHash, parsed);
      }
    } catch (e: any) {
      if (e?.status === 429 || e?.message?.includes("429") || e?.message?.includes("Quota")) {
        console.warn(`[ai] Quota/rate limit encountered on story ${index + 1}. Preserving local NLP synthesis.`);
      } else {
        console.warn(`[ai] Failed to enhance story ${index + 1}:`, e?.message || e);
      }
    }
  } else {
    story.evidenceTrail += " Local NLP synthesis.";
  }

  return story;
}







export function storyNeedsFullArticleEnrich(story: any): boolean {
  if (!story) return false;
  const consensus = String(story?.verifiableConsensus || story?.sharedFactualGround || "").trim();
  const desc = String(story?.description || "").trim();
  const looksLikeKeywords = /words in common|corroborated facts|words that appeared in several articles/i.test(consensus);

  // If the story already has a verified, substantive consensus and description, preserve it
  if (consensus.length >= 60 && !looksLikeKeywords && desc.length >= 50) {
    return false;
  }

  const persps = story?.perspectives || [];
  const hasLongBody = persps.some((p: any) => String(p.content || p.leadParagraph || "").length >= MIN_EXTRACTED_BODY);
  return !hasLongBody || looksLikeKeywords;
}

function fallbackFactsFromBodies(bodies: string[]): string[] {
  const text = bodies.join(" ");
  const parts = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 50 && s.length <= 420 && !/^https?:/i.test(s));
  const unique: string[] = [];
  for (const s of parts) {
    if (!unique.some((u) => u.slice(0, 40) === s.slice(0, 40))) unique.push(s);
    if (unique.length >= 6) break;
  }
  return unique.slice(0, 6);
}

function applyLanguageFromBodies(story: any, bodies: string[]) {
  try {
    const rawLangCode = detectLanguage(bodies.join("\n")).language;
    const langNameMap: Record<string, string> = {
      hi: "Hindi",
      bn: "Bengali",
      ta: "Tamil",
      te: "Telugu",
      mr: "Marathi",
      kn: "Kannada",
      ml: "Malayalam",
      en: "English",
      gu: "Gujarati",
      pa: "Punjabi",
      or: "Odia",
      as: "Assamese",
      ur: "Urdu",
    };
    story.language = langNameMap[rawLangCode] || rawLangCode || story.language;
  } catch {
    // keep existing language
  }
}

async function applyEntitiesFromBodies(story: any, bodies: string[]) {
  try {
    const { extractEntitiesDetailed } = await import("./nlp/entity.service");
    const detailed = await extractEntitiesDetailed(bodies.join("\n").slice(0, 24000));
    const pick = (types: string[]) => [
      ...new Set(
        (detailed || [])
          .filter((e: any) => types.includes(String(e.type || "").toUpperCase()))
          .map((e: any) => String(e.text || "").trim())
          .filter((t: string) => t.length > 1)
      ),
    ].slice(0, 24);
    const people = pick(["PERSON", "PER"]);
    const organisations = pick(["ORGANISATION", "ORGANIZATION", "ORG"]);
    const places = pick(["LOCATION", "LOC", "GPE", "PLACE"]);
    const prev = story.entities && typeof story.entities === "object" ? story.entities : {};
    story.entities = { ...prev, people, organisations, orgs: organisations, places };
  } catch (err) {
    console.warn("entity enrich skipped:", err);
  }
}

export async function enrichStoryFromFullArticles(story: any): Promise<any> {
  if (!story) return story;
  const persps = Array.isArray(story.perspectives) ? story.perspectives : [];
  if (!persps.length) return story;

  const extractLimit = pLimit(4);
  await Promise.all(persps.map((p: any) => extractLimit(async () => {
    // Always route through fillExtractedBody so click-enrich cannot stamp fake EXTRACTED
    // and failed/short extracts stay off the NLP path below.
    const before = String(p.content || "");
    await fillExtractedBody(p);
    if (p.canonicalUrl) p.canonicalDomain = p.canonicalDomain || p.canonicalUrl;
    // If extract returned empty, keep prior body but demote any bogus EXTRACTED stamp.
    if (!String(p.content || "").trim() && before) {
      p.content = before;
      p.extractionStatus = demoteFakeExtracted(p.extractionStatus, p.content);
    }
    if (p.content) {
      p.bodyWordCount = String(p.content).split(/\s+/).filter(Boolean).length;
      if (!p.leadParagraph) p.leadParagraph = String(p.content).slice(0, 2000);
    }
  })));

  const extracted = persps.filter((p: any) =>
    p.extractionStatus === "EXTRACTED" && String(p.content || "").length >= MIN_EXTRACTED_BODY
  );
  if (!extracted.length) return story;

  const bodies = extracted.map((p: any) => String(p.content));
  const scrapedN = extracted.length;
  const trailPrefix = `Read ${scrapedN} full articles.`;
  const prevTrail = String(story.evidenceTrail || "");
  story.evidenceTrail = prevTrail.includes("Read ") && prevTrail.includes("full article")
    ? prevTrail.replace(/Read\s+\d+\s+full articles\.?/i, trailPrefix).trim()
    : (prevTrail ? `${trailPrefix} ${prevTrail}` : trailPrefix);

  applyLanguageFromBodies(story, bodies);
  await applyEntitiesFromBodies(story, bodies);

  let geminiOk = false;
  if (ai) {
    try {
      const contextBlocks = extracted.map((p: any) => {
        return `Outlet: ${sanitizeForPrompt(p.source || "Desk")}
Headline: ${sanitizeForPrompt(p.title || story.title || "")}
Article Content:
${sanitizeForPrompt(String(p.content || "").slice(0, 8000), 8000)}`;
      });
      const context = contextBlocks.join("\n\n====================\n\n");
      const prompt = `You are a Senior Investigative News Editor at The Paperback.
Analyze the following full article bodies from ${extracted.length} Indian newsrooms covering this event.

TRUTH RULES (non-negotiable):
- ONLY use facts present in the Article Content blocks below.
- NEVER invent facts, numbers, quotes, desks, places, or timelines not present in the provided excerpts.
- If evidence is thin: say so / NEEDS CONTEXT / omit the claim â€” do NOT fill with model knowledge.

Strict Editorial Directives:
1. Objectivity: Present unvarnished, factual truth. Avoid partisan framing.
2. Canonical English: The Paperback platform's standard canonical language is English. You MUST translate and synthesize all outputs (summary, verifiableConsensus, narrativeLandscape, perspectives narrativeSummary/framingLens, and timeline) into fluent, accurate, objective ENGLISH, even if the source articles and quotes are originally in Hindi, Bengali, Tamil, or other regional languages.
3. verifiableConsensus must be newline-separated bullet facts drawn from the article bodies â€” real events, numbers, names, and outcomes that appear in the excerpts. Do NOT output a keyword list. Do NOT start with "Words in common" or "Corroborated facts".
4. Ground the timeline only in dates/sequences that appear in the article text.
5. Keep each newsroom's framing distinct.

Reporting to Analyze:
${context}`;

      const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";
      const response = await generateContentWithFallback(ai, {
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              summary: { type: "STRING" },
              verifiableConsensus: { type: "STRING" },
              narrativeLandscape: { type: "STRING" },
              perspectives: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    source: { type: "STRING" },
                    narrativeSummary: { type: "STRING" },
                    framingLens: { type: "STRING" }
                  },
                  required: ["source", "narrativeSummary"]
                }
              },
              timeline: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    date: { type: "STRING" },
                    title: { type: "STRING" },
                    description: { type: "STRING" },
                    verified: { type: "BOOLEAN" }
                  },
                  required: ["date", "title", "description"]
                }
              }
            },
            required: ["summary", "verifiableConsensus", "narrativeLandscape", "perspectives"]
          }
        }
      });

      if (response.text) {
        let text = response.text.trim();
        if (text.startsWith("```json")) text = text.substring(7);
        if (text.startsWith("```")) text = text.substring(3);
        if (text.endsWith("```")) text = text.substring(0, text.length - 3);
        const parsed = JSON.parse(text);
        if (parsed.summary) story.description = parsed.summary;
        if (parsed.verifiableConsensus) {
          const vc = String(parsed.verifiableConsensus).trim();
          const bad = /^(words in common|corroborated facts|words that appeared in several articles)/i.test(vc);
          if (!bad) story.verifiableConsensus = vc;
        }
        if (parsed.narrativeLandscape) story.narrativeLandscape = parsed.narrativeLandscape;
        if (Array.isArray(parsed.timeline) && parsed.timeline.length > 0) {
          story.timeline = parsed.timeline.map((t: any) => ({ ...t, date: String(t.date || "") }));
        }
        if (Array.isArray(parsed.perspectives)) {
          story.perspectives = story.perspectives.map((p: any) => {
            const aiPersp = parsed.perspectives.find((ap: any) => ap.source === p.source);
            return aiPersp ? { ...p, ...aiPersp, content: p.content, extractionStatus: p.extractionStatus } : p;
          });
        }
        geminiOk = true;
      }
    } catch (e: any) {
      console.warn("[enrich] Gemini failed, using body fallback:", e?.message || e);
    }
  }

  if (!geminiOk) {
    const existingDesc = String(story.description || "").trim();
    const existingConsensus = String(story.verifiableConsensus || "").trim();
    const consensusIsKeywordList = /words in common|corroborated facts|words that appeared in several articles/i.test(existingConsensus);

    if (!existingDesc || existingDesc.length < 40) {
      const first = bodies[0] || "";
      const paras = first.split(/\n+/).map((t) => t.trim()).filter((t) => t.length > 40);
      story.description = (paras.slice(0, 2).join(" ") || first).slice(0, 1200);
    }
    if (!existingConsensus || existingConsensus.length < 40 || consensusIsKeywordList) {
      const facts = fallbackFactsFromBodies(bodies);
      if (facts.length) story.verifiableConsensus = facts.join("\n");
    }
  }

  return story;
}


export async function getLiveNews(): Promise<{ stories: NewsStory[]; wire: LiveWireItem[], homepage_payload?: any }> {
  try {
    try { await archiveStaleStories(); } catch (e) { console.warn('[getLiveNews] archive/reactivate skipped:', e); }
    console.log("Background Ingestion: Fetching live national feeds...");
    const feedResults = await fetchAllSources();
    
    // Group by outlet and round-robin interleave to ensure all outlets get equal representation
    const unvisitedBySource = feedResults.map(list => 
      (list || []).filter(a => a && a.title && !isJunkTitle(a.title))
    );

    const interleavedArticles: RawArticle[] = [];
    let added = true;
    let index = 0;
    while (added && interleavedArticles.length < 120) {
      added = false;
      for (const list of unvisitedBySource) {
        if (index < list.length) {
          interleavedArticles.push(list[index]);
          added = true;
        }
      }
      index++;
    }

    const allArticles = interleavedArticles;

    try { await seedPulseFromOpinion(allArticles); } catch (e) { console.warn("Pulse seed skipped:", e); }

    if (allArticles.length === 0) return { stories: [], wire: [] };

    // Deduplication
    const db = await dbPromise;
    const existingUrls = await db.all('SELECT url FROM live_wire');
    const existingUrlSet = new Set(existingUrls.map((row: any) => row.url));
    const newArticles = allArticles.filter(art => !existingUrlSet.has(art.url)).slice(0, 80);

    if (newArticles.length === 0) {
      console.log("Background Ingestion: No new articles found.");
      return { stories: [], wire: [] };
    }

    // Step 1: Tripartite Clustering & Syndication Filter
    const enrichedArticles: any[] = [];
    console.log(`[local] Processing ${newArticles.length} diverse articles from ${new Set(newArticles.map(a => a.source)).size} outlets...`);
    
    // State Hydration: Fetch existing ACTIVE stories to cluster against
    const activeStories = await getActiveStoriesForClustering();
    
    // Concurrency limit for hydration
    const limit = pLimit(10);
    
    const hydratedClusters = await Promise.all(activeStories.map(story => limit(async () => {
      const perspectiveBodies = (story.perspectives || []).map((p: any) => String(p.content || "")).filter((s: string) => s.length >= MIN_EXTRACTED_BODY);
      const body = perspectiveBodies.join("\n") || (String(story.description || "").length >= MIN_EXTRACTED_BODY ? String(story.description) : "");
      if (!body) return null;
      const hash = crypto.createHash('sha256').update(body.slice(0, 4000)).digest('hex');
      let cache = await getAiCache(hash);
      if (!cache || !cache.embedding || cache.embedding.length < 8) {
          const embedding = await get_text_embedding(body);
          const ext = await extract_entities_and_predicate(body);
          cache = { ...ext, embedding };
          await setAiCache(hash, cache);
      }
      const langResult = detectLanguage(body);
      const language = langResult.language;
      const temporalSignals = extractTemporalSignals(body);
      const c = story.perspectives.map((p: any) => ({
         title: p.title || story.title,
         source: p.source,
         pubDate: p.publishedAt,
         url: p.url,
         content: p.content || body,
         extractionStatus: (p.extractionStatus === "EXTRACTED" && String(p.content || "").length >= MIN_EXTRACTED_BODY)
          ? "EXTRACTED"
          : (p.extractionStatus && p.extractionStatus !== "EXTRACTED"
            ? p.extractionStatus
            : (String(p.content || "").length >= MIN_EXTRACTED_BODY ? "PARTIAL" : "FAILED")),
         embedding: cache.embedding,
         entities: cache.entities,
         predicate: cache.predicate,
         geoOrigin: cache.geoOrigin,
         publisherTier: cache.publisherTier,
         ownershipGroup: get_ownership_group(p.source),
         language,
         temporalSignals
      }));
      (c as any).existingId = story.id;
      (c as any).originalLength = c.length;
      return c;
    })));

    const clusters: any[][] = hydratedClusters.filter(Boolean);

    const limitExtraction = pLimit(6);
    const pendingWire: any[] = [];
    
    // Extract full article bodies first. NLP/cluster only on EXTRACTED bodies >= 500 chars.
    const processedArticles = await Promise.all(newArticles.map(article => limitExtraction(async () => {
      if (!article.title) return null;

      let extractedContent = "";
      let extractionStatus: any = "FAILED";
      let canonicalUrl = article.canonicalUrl;
      if (article.url) {
        try {
          const extractResult = await extractArticleContent(article.url);
          extractedContent = extractResult.text || "";
          extractionStatus = extractResult.status || "FAILED";
          canonicalUrl = extractResult.canonicalUrl || article.url;
        } catch (err) {
          console.warn(`[extractor] Extraction failed for ${article.url}:`, (err as Error)?.message || err);
          extractionStatus = "FAILED";
        }
      }

      const fullyExtracted = extractionStatus === "EXTRACTED" && extractedContent.length >= MIN_EXTRACTED_BODY;
      if (!fullyExtracted) {
        return {
          ...article,
          content: extractedContent,
          extractionStatus,
          canonicalUrl,
          liveWireOnly: true,
        };
      }

      const textForNlp = extractedContent;

      const hash = crypto.createHash('sha256').update(extractedContent.slice(0, 4000)).digest('hex');
      let cache = await getAiCache(hash);

      if (!cache || !cache.embedding || cache.embedding.length < 8) {
          const embedding = await get_text_embedding(textForNlp);
          const ext = await extract_entities_and_predicate(textForNlp);
          cache = { ...ext, embedding };
          await setAiCache(hash, cache);
      }

      const minhash = compute_minhash_signature(extractedContent);
      const ownershipGroup = get_ownership_group(article.source);

      const wireOverlap = query_lsh_wire_index(minhash);
      const isWire = wireOverlap >= 0.65;

      const langResult = detectLanguage(extractedContent);
      const language = langResult.language;
      const temporalSignals = extractTemporalSignals(extractedContent);

      add_to_wire_index(article.url, minhash);

      return {
        ...article,
        content: extractedContent,
        extractionStatus,
        canonicalUrl,
        liveWireOnly: false,
        embedding: cache.embedding,
        entities: cache.entities,
        predicate: cache.predicate,
        geoOrigin: cache.geoOrigin,
        publisherTier: cache.publisherTier,
        minhash,
        isWire,
        ownershipGroup,
        language,
        temporalSignals
      };
    })));
    
    for (const enriched of processedArticles) {
      if (!enriched) continue;
      if (enriched.liveWireOnly) {
        pendingWire.push(enriched);
        continue;
      }
      enrichedArticles.push(enriched);
    }

    for (const article of enrichedArticles) {
      let matchedCluster: any[] | null = null;
      for (const cluster of clusters) {
        for (const member of cluster) {
          const distance = cluster_distance(article, member);
          
          if (distance < CLUSTERING_THRESHOLD) {
            matchedCluster = cluster;
            break;
          }
        }
        if (matchedCluster) break;
      }
      if (matchedCluster) matchedCluster.push(article);
      else clusters.push([article]);
    }

    // Phase 2 & 4: Eligibility Gate and Importance Scoring
    const candidateClusters = [];
    const wireArticles: any[] = [...pendingWire];
    const rejectedClusters: any[] = [];

    for (const cluster of clusters) {
      const independentSources = new Set();
      cluster.forEach(a => {
          if (a.ownershipGroup) {
              independentSources.add(a.ownershipGroup);
          }
      });
      const n_eff = independentSources.size;
      
      const isNewCluster = !(cluster as any).existingId;
      const gotUpdated = (cluster as any).existingId && cluster.length > ((cluster as any).originalLength || 0);

      const clusterHayTitle = cluster.map((c: any) => c.title || "").join(" | ");
      const clusterHayDesc = cluster.map((c: any) => c.description || "").join(" ");
      const neTribal = isNeOrTribalGeo(clusterHayTitle, clusterHayDesc);
      const junkCluster = cluster.every((c: any) => isJunkTitle(c.title || ""));
      if (junkCluster) {
        rejectedClusters.push({ cluster, n_eff });
        continue;
      }
      if (n_eff >= 1 || (neTribal && cluster.length >= 1)) {
        const scores = calculateClusterImportance(cluster, Math.max(n_eff, 1));
        candidateClusters.push({
            cluster,
            n_eff,
            importanceScore: scores.importanceScore, 
            impact: scores.impactScore, 
            breadth: scores.breadthScore, 
            velocity: scores.velocityScore, 
            divergence: scores.divergenceScore, 
            regionalGap: scores.regionalGapScore, 
            isExistingUnchanged: !isNewCluster && !gotUpdated
        });
      } else {
        if (cluster.length >= 3) {
            console.log(`[Gate Rejected] Cluster of size ${cluster.length} rejected because n_eff is ${n_eff}. Groups: ${Array.from(independentSources).join(", ")}. Titles: ${cluster.map((c: any) => c.title).slice(0,3).join(" | ")}`);
        }
        rejectedClusters.push({
            cluster,
            n_eff
        });
        wireArticles.push(...cluster); // Failed gate, send to wire
      }
    }


    // Sort candidate clusters by importanceScore descending so highest value stories get synthesized first
    candidateClusters.sort((a, b) => (b.importanceScore || 0) - (a.importanceScore || 0));

    // Sequential pacing (pLimit 1) to avoid 429 quota bursts
    const limitAI = pLimit(1);

    // Now PROCESS candidates with NLP-synchronized AI
    console.log(`[local] Synthesizing ${candidateClusters.length} clusters (sorted by importance)...`);
    const processedCandidates = await Promise.all(candidateClusters.map((candidate, i) => limitAI(async () => {
        let aiStory: NewsStory | null = null;
        try {
            aiStory = await processClusterWithAI(candidate, i);
        } catch (e) {
            console.error(e);
        }
        if (aiStory) {
            const cat = (aiStory.category as string) || "News";
            const mappedCat = ["Politics & Governance", "Economy, Markets & Business", "States & Regions", "Courts, Law & Constitution", "International & Strategy", "Science, Climate & Tech", "Society, Health & Culture"].includes(cat) ? cat : "Politics & Governance";
            aiStory.category = mappedCat;

            (aiStory as any).importanceScore = candidate.importanceScore;
            (aiStory as any).impactScore = candidate.impact;
            (aiStory as any).breadthScore = candidate.breadth;
            (aiStory as any).velocityScore = candidate.velocity;
            (aiStory as any).divergenceScore = candidate.divergence;
            (aiStory as any).regionalGapScore = candidate.regionalGap;
            
            aiStory.independentReportingCount = candidate.n_eff;
            aiStory.sourceCount = candidate.cluster.length;
            
            aiStory.dataAudit.push({ metric: "Importance Score", value: candidate.importanceScore.toFixed(2), status: "Verified", source: "Algorithm" });
            
            // Collect entities for Jaccard
            const entities = new Set<string>(candidate.cluster.flatMap((c: any) => c.entities || []));
            return {
                aiStory,
                importanceScore: candidate.importanceScore,
                beat_category: mappedCat,
                entities,
                cluster_id: aiStory.id,
                ...candidate
            };
        } else {
            wireArticles.push(...candidate.cluster);
            return null;
        }
    })));

    const eligible_curation_pool = processedCandidates.filter(c => c !== null) as any[];

    // Stage 8: 20-Story Daily Curation Algorithm
    eligible_curation_pool.sort((a, b) => b.importanceScore - a.importanceScore);

    const daily_edition_20: any[] = [];
    
    const beat_quotas: Record<string, { current: number, min: number, max: number }> = {
      "Politics & Governance": { current: 0, min: 3, max: 5 },
      "Economy, Markets & Business": { current: 0, min: 3, max: 4 },
      "States & Regions": { current: 0, min: 4, max: 6 },
      "Courts, Law & Constitution": { current: 0, min: 2, max: 4 },
      "International & Strategy": { current: 0, min: 2, max: 3 },
      "Science, Climate & Tech": { current: 0, min: 1, max: 3 },
      "Society, Health & Culture": { current: 0, min: 1, max: 3 }
    };

    function entity_jaccard(candidateSet: Set<string>, selectedSet: Set<string>) {
      let intersection = 0;
      for (const elem of candidateSet) { if (selectedSet.has(elem)) intersection++; }
      const union = candidateSet.size + selectedSet.size - intersection;
      return union === 0 ? 0 : intersection / union;
    }

    function violates_entity_constraint(candidate: any, selected_stories: any[]) {
        return selected_stories.some(selected => entity_jaccard(candidate.entities, selected.entities) > 0.40);
    }

    // First pass: maximize importance while respecting hard caps and entity diversity
    for (const candidate of eligible_curation_pool) {
        if (daily_edition_20.length >= 20) break;
        
        const beat = candidate.beat_category;
        if (!beat_quotas[beat]) continue;
        if (beat_quotas[beat].current >= beat_quotas[beat].max) continue;
        if (violates_entity_constraint(candidate, daily_edition_20)) continue;

        daily_edition_20.push(candidate);
        beat_quotas[beat].current += 1;
    }

    // Second pass: satisfy beat floors where possible.
    for (const beat of Object.keys(beat_quotas)) {
        const quota = beat_quotas[beat];
        if (quota.current >= quota.min) continue;

        const candidates_for_beat = eligible_curation_pool.filter(c => !daily_edition_20.includes(c) && c.beat_category === beat);

        for (const candidate of candidates_for_beat) {
            if (quota.current >= quota.min) break;
            if (violates_entity_constraint(candidate, daily_edition_20)) continue;

            if (daily_edition_20.length < 20) {
                daily_edition_20.push(candidate);
                quota.current += 1;
            } else {
                // Replace lowest-importance story
                const replaceable = daily_edition_20
                    .filter(s => beat_quotas[s.beat_category].current > beat_quotas[s.beat_category].min)
                    .sort((a, b) => a.importanceScore - b.importanceScore);

                for (const existing of replaceable) {
                    if (candidate.importanceScore <= existing.importanceScore) continue;

                    const remaining = daily_edition_20.filter(s => s !== existing);
                    if (violates_entity_constraint(candidate, remaining)) continue;

                    daily_edition_20.splice(daily_edition_20.indexOf(existing), 1);
                    daily_edition_20.push(candidate);

                    beat_quotas[existing.beat_category].current -= 1;
                    quota.current += 1;
                    break;
                }
            }
        }
    }

    // Push unselected to wire
    for (const c of eligible_curation_pool) {
        if (!daily_edition_20.includes(c)) {
             wireArticles.push(...c.cluster);
        }
    }

    for (const beat of Object.keys(beat_quotas)) {
        const quota = beat_quotas[beat];
        // Gracefully allow fewer stories if strict n_eff >= 6 filters everything out
        if (quota.current > quota.max) {
             console.warn(`Beat constraint max violated for: ${beat}`);
        }
    }

    // No padding with rejected/junk clusters. Fewer than 20 is allowed.

    // ---------------------------------------------------------
    // STAGE 9: Homepage Band Slot Allocation
    // ---------------------------------------------------------
    const cleaned_edition = daily_edition_20.filter(c => c && c.aiStory && !isJunkTitle(c.aiStory.title || ""));
    daily_edition_20.length = 0;
    daily_edition_20.push(...cleaned_edition);
    daily_edition_20.sort((a, b) => b.importanceScore - a.importanceScore);

    const assigned_ids = new Set<string>();

    const lead_candidates = [...daily_edition_20].sort((a, b) => {
        const aRank = a.page_one_rank !== undefined ? a.page_one_rank : (a.importanceScore || 0);
        const bRank = b.page_one_rank !== undefined ? b.page_one_rank : (b.importanceScore || 0);
        if (bRank !== aRank) {
            return bRank - aRank;
        }
        return (b.breadth || 0) - (a.breadth || 0);
    });
    
    const lead_story = lead_candidates[0];
    if (lead_story) assigned_ids.add(lead_story.cluster_id);

    const remaining1 = daily_edition_20.filter(c => !assigned_ids.has(c.cluster_id));
    const trending = remaining1.sort((a, b) => (b.velocity || 0) - (a.velocity || 0)).slice(0, 4);
    trending.forEach(c => assigned_ids.add(c.cluster_id));

    const remaining2 = daily_edition_20.filter(c => !assigned_ids.has(c.cluster_id));
    const todays_essentials = remaining2.sort((a, b) => (b.impact || 0) - (a.impact || 0)).slice(0, 4);
    todays_essentials.forEach(c => assigned_ids.add(c.cluster_id));

    const remaining3 = daily_edition_20.filter(c => !assigned_ids.has(c.cluster_id));
    const coverage_differs = remaining3.sort((a, b) => (b.divergence || 0) - (a.divergence || 0)).slice(0, 2);
    coverage_differs.forEach(c => assigned_ids.add(c.cluster_id));

    const remaining4 = daily_edition_20.filter(c => !assigned_ids.has(c.cluster_id));
    const voices_of_india = remaining4.filter(c => c.beat_category === 'States & Regions').sort((a, b) => (b.regionalGap || 0) - (a.regionalGap || 0)).slice(0, 4);
    voices_of_india.forEach(c => assigned_ids.add(c.cluster_id));

    const remaining5 = daily_edition_20.filter(c => !assigned_ids.has(c.cluster_id));
    const other_developments = remaining5.slice(0, 5);

    const homepage_payload = {
        leadStory: lead_story ? lead_story.aiStory : null,
        trendingRail: trending.map(c => c.aiStory),
        todaysEssentials: todays_essentials.map(c => c.aiStory),
        coverageDiffers: coverage_differs.map(c => c.aiStory),
        voicesOfIndia: voices_of_india.map(c => c.aiStory),
        otherDevelopments: other_developments.map(c => c.aiStory)
    };

    if (
        homepage_payload.trendingRail.length !== 4 ||
        homepage_payload.todaysEssentials.length !== 4 ||
        homepage_payload.coverageDiffers.length !== 2 ||
        homepage_payload.voicesOfIndia.length !== 4 ||
        homepage_payload.otherDevelopments.length !== 5
    ) {
        console.warn("Homepage band allocation did not produce exactly 20 slots.");
    }

    const homepage_story_ids = [
        homepage_payload.leadStory?.cluster_id,
        ...homepage_payload.trendingRail.map(s => s?.cluster_id),
        ...homepage_payload.todaysEssentials.map(s => s?.cluster_id),
        ...homepage_payload.coverageDiffers.map(s => s?.cluster_id),
        ...homepage_payload.voicesOfIndia.map(s => s?.cluster_id),
        ...homepage_payload.otherDevelopments.map(s => s?.cluster_id)
    ].filter(id => id !== undefined);

    if (homepage_story_ids.length !== 20 || new Set(homepage_story_ids).size !== 20) {
        console.warn("Homepage allocation is not mutually exclusive or not exactly 20.");
    }

    const homepageStories = daily_edition_20.map(c => c.aiStory);
    const extraNe = eligible_curation_pool.filter(c => {
      if (daily_edition_20.includes(c)) return false;
      const titles = (c.cluster || []).map((x: any) => x.title || "").join(" | ");
      const descs = (c.cluster || []).map((x: any) => x.description || "").join(" ");
      const stTitle = c.aiStory?.title || "";
      return isNeOrTribalGeo(stTitle, "") || isNeOrTribalGeo(titles, descs);
    }).slice(0, 40);
    extraNe.forEach(c => {
      if (c.aiStory) {
        c.aiStory.blindspot = isNeOrTribalGeo(c.aiStory.title || "", c.aiStory.description || "")
          ? "North-east or tribal-belt geography that did not make the national 20."
          : (c.aiStory.blindspot || "");
      }
    });
    const stories = [...homepageStories, ...extraNe.map(c => c.aiStory).filter(Boolean)];

    // Build Live Wire; NE/tribal first so Voices can see local filings.
    wireArticles.sort((a: any, b: any) => {
      const nb = Number(isNeOrTribalGeo(b.title || "", b.description || "")) || Number(isRegionalDesk(b.source || ""));
      const na = Number(isNeOrTribalGeo(a.title || "", a.description || "")) || Number(isRegionalDesk(a.source || ""));
      return nb - na;
    });
    const wire: LiveWireItem[] = wireArticles.slice(0, 80).map((art, idx) => {
      const wireId = `wire-${Date.now()}-${idx}`;
      const matchedStory = stories.find(s => {
        if (!s) return false;
        if (s.sourceUrl === art.url) return true;
        if (s.perspectives?.some(p => p.url === art.url)) return true;
        const sTokens = new Set((s.title || "").toLowerCase().split(/\s+/).filter(w => w.length > 3));
        const aTokens = (art.title || "").toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
        const matches = aTokens.filter((w: string) => sTokens.has(w)).length;
        return matches >= 3 && (matches / Math.max(aTokens.length, 1)) >= 0.4;
      });

      return {
        id: wireId,
        title: art.title,
        source: art.source,
        bias: "center",
        url: art.url,
        timestamp: art.pubDate,
        category: art.category,
        institution: "Media Desk",
        status: "Verified",
        relatedStoryId: matchedStory ? matchedStory.id : wireId,
        summary: art.description || art.title,
        region: inferStoryRegion(art.title || "", art.description || "") || undefined,
        extractionStatus: art.extractionStatus,
        canonicalUrl: art.canonicalUrl
      };
    });

    await saveNewsData(stories, wire);
    console.log(`Background Ingestion: Completed local pipeline for ${stories.length} stories.`);
    return { stories, wire, homepage_payload };
  } catch (err) {
    console.error("Live news ingestion error:", err);
    return { stories: [], wire: [] };
  }
}

const LIVE_STOP = new Set("the a an and or of to in on for from with by as at is was were be been being this that those these it its their his her they we you i not no but if than then also into over after before about against between during without within amid among across while will would can could should may might must has have had do did does".split(" "));

function liveTokens(s: string): string[] {
  return String(s || "").toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3 && !LIVE_STOP.has(w));
}

function liveClaimScore(claim: string, text: string): number {
  const toks = liveTokens(claim);
  if (!toks.length) return 0;
  const hay = String(text || "").toLowerCase();
  return toks.filter(t => hay.includes(t)).length / toks.length;
}

type LiveCache = { at: number; articles: RawArticle[] };
let liveRssCache: LiveCache | null = null;

async function getFreshRssArticles(force = false): Promise<RawArticle[]> {
  if (!force && liveRssCache && Date.now() - liveRssCache.at < 8 * 60 * 1000) {
    return liveRssCache.articles;
  }
  const parts = await Promise.all(RSS_FEEDS.map(f => fetchRssFeed(f.url, f.category, f.region, f.name)));
  const articles = parts.flat().filter(a => a && a.title && !isJunkTitle(a.title));
  liveRssCache = { at: Date.now(), articles };
  console.log(`[live] Pulled ${articles.length} RSS items from ${RSS_FEEDS.length} feeds.`);
  return articles;
}

export async function searchLiveNews(query: string): Promise<NewsStory[]> {
  const articles = await getFreshRssArticles();
  const ranked = articles
    .map(a => ({ a, score: liveClaimScore(query, `${a.title} ${a.description || ""}`) }))
    .filter(x => x.score >= 0.28)
    .sort((a, b) => b.score - a.score)
    .slice(0, 40);

  const groups = new Map<string, RawArticle[]>();
  for (const { a } of ranked) {
    const key = (a.title || "").toLowerCase().slice(0, 48);
    const bucket = groups.get(key) || [];
    bucket.push(a);
    groups.set(key, bucket);
  }

  const stories: NewsStory[] = [];
  let i = 0;
  for (const cluster of groups.values()) {
    const framed = analyzeClusterFraming(cluster);
    stories.push({
      id: `live-search-${Date.now()}-${i++}`,
      title: framed.title,
      category: cluster[0].category || "News",
      description: framed.description,
      perspectives: framed.perspectives as any,
      verifiableConsensus: framed.verifiableConsensus,
      narrativeLandscape: framed.narrativeLandscape,
      sourceCount: cluster.length,
      timestamp: new Date().toISOString(),
    } as any);
  }
  return stories;
}


let bgeModel: any = null;
let bgeTokenizer: any = null;
let bgeInitPromise: Promise<any> | null = null;
let bgeFailed = false;

async function getBgeReranker() {
  console.warn("BGE Reranker disabled to prevent ONNX native crash. Returning null.");
  return null;
}

const INDIC_STOP_WORDS = ["à¤¹à¥ˆ", "à¤”à¤°", "à¤®à¥‡à¤‚", "à¤•à¥€", "à¤¸à¥‡", "à¤•à¥‡", "à¤•à¥‹", "à¤ªà¤°", "à¤¨à¤¹à¥€à¤‚", "à¤à¤•", "à¤¯à¤¹", "à¤¹à¥€", "à¤²à¤¿à¤", "à¤¥à¤¾", "à¤¹à¥‹", "à¤­à¥€", "à¤¹à¥ˆà¤‚", "à¤•à¤°", "à¤¨à¥‡", "à¤¤à¥‹", "à¤œà¥‹", "à¤•à¤¿", "à¤•à¤¾"];

const FACT_CHECK_BODY_CAP = 8000;

function factCheckScoreText(art: any): string {
  if (isFullyExtracted(art)) return String(art.content || "");
  return String(art.title || "");
}

function factCheckEvidenceNote(art: any): string {
  return isFullyExtracted(art) ? "from full article" : "headline only";
}

function factCheckPromptExcerpt(art: any): string {
  const source = art.source || "Unknown";
  const title = art.title || "";
  if (isFullyExtracted(art)) {
    const body = String(art.content || "").slice(0, FACT_CHECK_BODY_CAP);
    return `[${source}] ${title} (from full article):\n${body}`;
  }
  return `[${source}] ${title} (headline only)`;
}

function buildFactCheckEvidenceTrail(arts: any[]): string {
  if (!arts.length) return "No matching live reports found.";
  return arts.slice(0, 5).map((u: any) => `${u.source || "Unknown"}: ${u.title || ""} (${factCheckEvidenceNote(u)})`).join(" | ");
}

export async function liveFactCheckClaim(claim: string) {
  // 1. BM25 Evidence Retrieval
  const db = await dbPromise;
  
  const ftsTokens = claim.toLowerCase().replace(/[^a-z0-9\u0900-\u097F ]/g, ' ').trim().split(/\s+/).filter(w => !LIVE_STOP.has(w) && !INDIC_STOP_WORDS.includes(w) && w.length > 2);
  const ftsMatch = ftsTokens.length > 0 ? ftsTokens.map(t => `"${t}"`).join(' OR ') : claim;

  let top20 = [];
  if (ftsTokens.length > 0) {
    try {
      top20 = await db.all(`
        SELECT id, title, summary, source, url, bm25(live_wire_fts) as bm25_score
        FROM live_wire_fts
        WHERE live_wire_fts MATCH ?
        ORDER BY bm25_score LIMIT 20
      `, [ftsMatch]);
    } catch (e) {
      console.warn("FTS5 match failed, falling back", e);
    }
  }

  // Fallback to old RSS method if FTS5 is empty or errors
  if (top20.length === 0) {
    const articles = await getFreshRssArticles();
    top20 = articles
      .map(a => ({ id: a.url, title: a.title, summary: a.description, source: a.source, url: a.url, bm25_score: liveClaimScore(claim, `${a.title} ${a.description || ""}`) }))
      .filter(x => x.bm25_score >= 0.15)
      .sort((a, b) => b.bm25_score - a.bm25_score)
      .slice(0, 20);
  }

  // 2. Syndication Collapse & Independent Source Grouping
  const uniqueGroups = new Map<string, any[]>();
  
  for (const article of top20) {
    const minhash = compute_minhash_signature((article.title || "") + " " + (article.summary || ""));
    const owner = get_ownership_group(article.source || "Unknown");
    
    const bucket = uniqueGroups.get(owner) || [];
    let isDuplicate = false;
    for (const existing of bucket) {
      const existingMinhash = compute_minhash_signature((existing.title || "") + " " + (existing.summary || ""));
      if (calculate_jaccard_overlap(minhash, existingMinhash) > 0.65) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      bucket.push(article);
      uniqueGroups.set(owner, bucket);
    }
  }

  const candidateEvidence = Array.from(uniqueGroups.values()).flat();

  // Extract full article bodies for this request (do not stampede desks).
  const extractLimit = pLimit(3);
  await Promise.all(candidateEvidence.map((art: any) => extractLimit(async () => {
    await fillExtractedBody(art);
  })));

  // 3. BGE Reranker (hard-disabled) / extracted-body token overlap
  const scoredCandidates: any[] = [];
  if (candidateEvidence.length > 0) {
    try {
      const bge = await getBgeReranker();
      if (!bge) throw new Error("BGE Reranker not available");
      
      const { model, tokenizer } = bge;
      for (const article of candidateEvidence) {
        const docText = isFullyExtracted(article)
          ? String(article.content || "").slice(0, FACT_CHECK_BODY_CAP)
          : String(article.title || "");
        
        const inferenceTimeout = new Promise((_, rj) => setTimeout(() => rj(new Error("BGE Inference timeout")), 3000));
        
        const infer = async () => {
          const inputs = await tokenizer(claim, { text_pair: docText, padding: true, truncation: true });
          const { logits } = await model(inputs);
          return logits.data[0];
        };
        
        const score = await Promise.race([infer(), inferenceTimeout]) as number;
        scoredCandidates.push({ ...article, rerankScore: score });
      }
    } catch (e) {
      console.warn("BGE reranking failed, using original scores", e);
      scoredCandidates.push(...candidateEvidence.map(a => ({
        ...a,
        rerankScore: liveClaimScore(claim, factCheckScoreText(a))
      })));
    }
  }
  
  scoredCandidates.sort((a, b) => b.rerankScore - a.rerankScore);
  const extractedCandidates = scoredCandidates.filter((a: any) => isFullyExtracted(a));
  const extractedCount = extractedCandidates.length;
  const topCandidates = (extractedCount > 0 ? extractedCandidates : scoredCandidates).slice(0, 5);

  const candidateContext = extractedCount > 0
    ? extractedCandidates.slice(0, 5).map(factCheckPromptExcerpt).join("\n\n")
    : "";

  let verdict = "NEEDS CONTEXT";
  let detail = extractedCount > 0
    ? "No credible reporting from Indian news desks supports this claim."
    : "No full articles could be read for this claim; headlines and RSS summaries alone are not enough to verify it.";
  let evidenceTrail = buildFactCheckEvidenceTrail(topCandidates);
  let confidenceScore = extractedCount > 0 ? 80 : 40;
  let primaryReportingOutlet = "Forensic Analysis";
  let corroboratingSources: string[] = [];

  const aiClient = await getAi();
  if (aiClient && extractedCount > 0) {
    try {
      const prompt = `You are a forensic journalistic fact-checker for an Indian news intelligence platform.
Analyze the following claim ONLY against the full article excerpts below. Do not use outside knowledge.

Claim to Fact-Check: "${sanitizeForPrompt(claim)}"

Full article excerpts (bodies actually read):
${sanitizeForPrompt(candidateContext, 45000)}

TRUTH RULES (non-negotiable):
- ONLY use facts present in the excerpts below.
- NEVER invent facts, numbers, quotes, desks, places, or timelines not present in the excerpts.
- If evidence is thin: choose NEEDS CONTEXT â€” do NOT fill gaps with model knowledge.

Instructions:
1. Determine the verdict:
   - "VERIFIED": Only if the claim is supported by matching statements in the full article bodies below. Never from headlines alone.
   - "FALSE": Only if the excerpts themselves contradict the claim. Do not invent contradictions from world knowledge.
   - "NEEDS CONTEXT": If the claim is unverified, missing crucial nuances, speculative, or disputed, or if the article bodies do not actually support the claim.
2. Detail: Provide a clear 2-3 sentence conclusion grounded in the excerpts. If thin evidence, say so.
3. Evidence Trail: Cite 1-3 sources as 'Source: Headline (from full article)' using only the excerpts that were read.
4. If the article bodies are about something else, state that indexed reporting does not support the claim.
5. Never invent VERIFIED from a headline when you have not seen a matching statement in the article body.

Respond strictly in this JSON format:
{
  "verdict": "VERIFIED" | "FALSE" | "NEEDS CONTEXT",
  "detail": "Clear, definitive forensic conclusion.",
  "evidenceTrail": "Source: Headline (from full article)",
  "primaryReportingOutlet": "Main source or 'Consensus Fact Check'",
  "corroboratingSources": ["Outlet 1", "Outlet 2"],
  "confidenceScore": 95
}`;

      const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";
      const response = await generateContentWithFallback(aiClient, {
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0,
          responseMimeType: "application/json",
        }
      });
      
      const resText = response.text || "{}";
      const parsed = JSON.parse(resText);
      
      if (parsed.verdict) verdict = parsed.verdict;
      if (parsed.detail) detail = parsed.detail;
      if (parsed.evidenceTrail) evidenceTrail = parsed.evidenceTrail;
      if (parsed.primaryReportingOutlet) primaryReportingOutlet = parsed.primaryReportingOutlet;
      if (Array.isArray(parsed.corroboratingSources)) corroboratingSources = parsed.corroboratingSources;
      if (typeof parsed.confidenceScore === 'number') confidenceScore = parsed.confidenceScore;

      if (verdict === "VERIFIED" && extractedCount === 0) {
        verdict = "NEEDS CONTEXT";
        detail = "No full articles could be read for this claim; headlines and RSS summaries alone are not enough to verify it.";
      }

      const builtTrail = buildFactCheckEvidenceTrail(topCandidates);
      const trailHasBodyNote = /from full article|headline only/i.test(String(evidenceTrail || ""));
      if (!trailHasBodyNote) {
        evidenceTrail = evidenceTrail ? `${evidenceTrail} | ${builtTrail}` : builtTrail;
      }
      
    } catch (e) {
      console.error("AI Fact Check Error:", e);
      detail = `Found ${topCandidates.length} candidate reports, but automated verification timed out.`;
      evidenceTrail = buildFactCheckEvidenceTrail(topCandidates);
    }
  } else if (extractedCount === 0) {
    verdict = "NEEDS CONTEXT";
    detail = "No full articles could be read for this claim; headlines and RSS summaries alone are not enough to verify it.";
    evidenceTrail = buildFactCheckEvidenceTrail(topCandidates);
    confidenceScore = 40;
    corroboratingSources = [];
  }

  // Count independent sources among corroborating evidence (extracted bodies only)
  const extractedSources = extractedCandidates.map((u: any) => u.source).filter(Boolean);
  const finalCorroborating = extractedCount === 0
    ? []
    : (corroboratingSources.length > 0
        ? corroboratingSources
        : extractedSources.slice(1));

  return {
    id: `fc-live-${Date.now()}`,
    claim,
    timestamp: new Date().toISOString(),
    verdict,
    verdictDetail: detail,
    primaryReportingOutlet: primaryReportingOutlet || (extractedCandidates[0]?.source || topCandidates[0]?.source || "Paperback Live Wire"),
    corroboratingSources: finalCorroborating,
    evidenceTrail: evidenceTrail,
    divergence: verdict === "FALSE" ? "Disproven claim / No credible news desk reports this." : "Cross-referenced with independent live wire groups.",
    secondarySources: scoredCandidates.slice(0, 8).map(u => ({
      publisher: u.source,
      headline: u.title,
      url: u.url,
      bias: "unscored",
      date: "Live RSS"
    })),
    confidenceScore: confidenceScore,
    liveHitCount: candidateEvidence.length,
    livePulled: top20.length
  };
}

function runLiveFactCheckFeed() {
  console.log("Fact-check live feed uses POST /api/news/fact-check against live RSS.");
}

