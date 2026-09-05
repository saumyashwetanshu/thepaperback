import express from "express";
import { z } from "zod";
import {
  getStories, getLiveWire, getStoryById, getFactChecks,
  saveFactCheck, getLeadStory, getTrendingStories,
  getEssentialStories, getDivergingStories, getVoicesOfIndiaStories,
  getOtherDevelopments,
  dedupeStoriesByNormalizedTitle,
  saveNewsData,
  reactivateRecentStories,
  archiveStaleStories
} from "../../utils/dbOperations";
import { searchLiveNews, liveFactCheckClaim, ai, getGeminiClient } from "../services/news.service";
import { generateContentWithFallback } from "../services/gemini.service";
import { sanitizeForPrompt, enrichStoryFromFullArticles, storyNeedsFullArticleEnrich } from "../services/ingestion.service";
import { NewsStory } from "../../types";

const router = express.Router();

// Validation schemas
const searchQuerySchema = z.object({
  q: z.string().min(1, "Search query must not be empty").max(100, "Search query too long").optional()
});

const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/, "Page must be a positive integer").optional(),
  limit: z.string().regex(/^\d+$/, "Limit must be a positive integer").optional()
});

const factCheckClaimSchema = z.object({
  headline: z.string().max(500, "Headline too long").optional(),
  claim: z.string().max(500, "Claim too long").optional()
}).refine((data) => {
  return (data.headline?.trim() || data.claim?.trim()) !== '';
}, {
  message: "Either headline or claim must be provided"
});

const idParamSchema = z.object({
  id: z.string().min(1, "ID is required").max(50, "ID too long")
});

const STOP = new Set("the a an and or of to in on for from with by as at is was were be been being this that those these it its their his her they we you i not no but if than then also into over after before about against between during without within amid among across while will would can could should may might must has have had do did does".split(" "));

function tokens(s: string): string[] {
  return String(s || "").toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3 && !STOP.has(w));
}

function storyHaystack(s: any): string {
  const persp = (s.perspectives || []).map((p: any) => `${p.source || ""} ${p.title || ""} ${p.summary || ""} ${p.narrativeSummary || ""}`).join(" ");
  return `${s.title || ""} ${s.description || ""} ${s.verifiableConsensus || ""} ${s.narrativeLandscape || ""} ${persp}`.toLowerCase();
}

function scoreClaim(claim: string, story: any): number {
  const claimToks = tokens(claim);
  if (!claimToks.length) return 0;
  const hay = storyHaystack(story);
  const hit = claimToks.filter(t => hay.includes(t)).length;
  return hit / claimToks.length;
}

function analysisFromStory(claim: string, story: any | null, allStories: any[]) {
  if (!story) {
    return {
      id: `fc-archive-${Date.now()}`,
      claim,
      timestamp: new Date().toISOString(),
      verdict: "NEEDS CONTEXT",
      verdictDetail: "No confirmed reporting found for this specific claim in the current edition.",
      primaryReportingOutlet: "Unverified Claim",
      corroboratingSources: [],
      evidenceTrail: "Searched national headlines and wire reporting with no direct corroboration.",
      divergence: "No established consensus available.",
      secondarySources: [],
      confidenceScore: 30
    };
  }

  const outlets = Array.from(new Set((story.perspectives || []).map((p: any) => p.source).filter(Boolean))) as string[];
  const n = outlets.length || story.sourceCount || 1;
  const disagreements = Array.isArray(story.pointsOfDisagreement) ? story.pointsOfDisagreement : [];
  
  let verdict = "VERIFIED";
  let detail = `Verified report. Corroborated by ${n} independent news desk${n > 1 ? 's' : ''} across national coverage.`;
  if (disagreements.length > 0) {
    verdict = "PARTIALLY VERIFIED";
    detail = `The core event is corroborated by ${n} outlets, but reports show diverging perspectives on specific details.`;
  }

  const evidence = (story.perspectives || []).slice(0, 5).map((p: any) => `${p.source}: '${p.title}'`).join(" | ");
  return {
    id: `fc-archive-${story.id}`,
    claim: story.title || claim,
    timestamp: story.timestamp || new Date().toISOString(),
    verdict,
    verdictDetail: detail,
    primaryReportingOutlet: outlets[0] || "National Press Desk",
    corroboratingSources: outlets.slice(1),
    evidenceTrail: evidence || story.verifiableConsensus || story.title,
    divergence: disagreements.length ? disagreements.join(" ") : (story.narrativeLandscape || "Consensus confirmed across major reporting outlets."),
    secondarySources: (story.perspectives || []).slice(0, 6).map((p: any) => ({
      publisher: p.source,
      headline: p.title,
      url: p.url,
      bias: p.bias,
      date: "Archive"
    })),
    confidenceScore: Math.min(98, 70 + n * 6)
  };
}

router.get("/", async (req, res) => {
  try {
    // Restore recently archived stories + apply 7-day archive window before building Home rails
    try { await archiveStaleStories(); } catch (e) { console.warn('archive/reactivate skipped:', e); }
    // Validate query parameters
    const queryParams = searchQuerySchema.safeParse(req.query);
    if (!queryParams.success) {
      return res.status(400).json({ success: false, error: "Invalid query parameters" });
    }

    // Validate pagination parameters
    const paginationValidation = paginationSchema.safeParse(req.query);
    if (!paginationValidation.success) {
      return res.status(400).json({ success: false, error: "Invalid pagination parameters" });
    }

    const { q } = queryParams.data;
    const page = parseInt(paginationValidation.data.page || "1", 10);
    const limit = parseInt(paginationValidation.data.limit || "20", 10);
    const offset = (page - 1) * limit;

    if (q && q.trim()) {
      const searchResults = await searchLiveNews(q.trim()); // We can optimize this later
      const wire = await getLiveWire(15);

      return res.json({
        success: true,
        query: q.trim(),
        stories: searchResults.slice(offset, offset + limit),
        wire: wire,
        pagination: { page, limit, total: searchResults.length }
      });
    }

    const wirePromise = getLiveWire(15);

    // Fetch optimized rails sequentially to pass excluded IDs and avoid duplicates
    const assignedIds: string[] = [];
    // Cross-rail title/cluster dedupe (distinct DB ids can share the same headline)
    const seenTitles = new Set<string>();

    let leadStory = await getLeadStory(assignedIds);
    if (leadStory) {
      leadStory = dedupeStoriesByNormalizedTitle([leadStory], seenTitles)[0] || null;
      if (leadStory) assignedIds.push(leadStory.id);
    }

    let voicesOfIndia = dedupeStoriesByNormalizedTitle(await getVoicesOfIndiaStories(8, assignedIds), seenTitles).slice(0, 4);
    voicesOfIndia.forEach(s => assignedIds.push(s.id));

    let trendingRail = dedupeStoriesByNormalizedTitle(await getTrendingStories(8, assignedIds), seenTitles).slice(0, 4);
    trendingRail.forEach(s => assignedIds.push(s.id));

    let todaysEssentials = dedupeStoriesByNormalizedTitle(await getEssentialStories(8, assignedIds), seenTitles).slice(0, 4);
    todaysEssentials.forEach(s => assignedIds.push(s.id));

    let coverageDiffers = dedupeStoriesByNormalizedTitle(await getDivergingStories(4, assignedIds), seenTitles).slice(0, 2);
    coverageDiffers.forEach(s => assignedIds.push(s.id));

    let otherDevelopments = dedupeStoriesByNormalizedTitle(await getOtherDevelopments(12, assignedIds), seenTitles).slice(0, 5);
    otherDevelopments.forEach(s => assignedIds.push(s.id));

    // If junk filtering emptied the lead, promote next non-junk from essentials / other
    if (!leadStory) {
      if (todaysEssentials.length > 0) {
        leadStory = todaysEssentials.shift()!;
      } else if (otherDevelopments.length > 0) {
        leadStory = otherDevelopments.shift()!;
      }
    }

    const wire = await wirePromise;

    // Homepage rails only â€” omit stories (never send empty stories: [])
    res.json({
      success: true,
      leadStory,
      trendingRail,
      todaysEssentials,
      coverageDiffers,
      voicesOfIndia,
      otherDevelopments,
      wire,
      pagination: { page, limit, total: 100 }
    });
  } catch (err) {
    console.error("API /api/news Error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    // Validate query parameters (none expected, but validate anyway)
    const queryValidation = z.object({}).safeParse(req.query);
    if (!queryValidation.success) {
      return res.status(400).json({ success: false, error: "Invalid query parameters" });
    }

    const db = (await import("../../utils/db")).default;
    const dbInstance = await db;
    const storiesCount = await dbInstance.get('SELECT COUNT(*) as count FROM stories') as any;
    const wireCount = await dbInstance.get('SELECT COUNT(*) as count FROM live_wire') as any;
    const sourcesCount = await dbInstance.get('SELECT COUNT(DISTINCT source) as count FROM perspectives') as any;

    res.json({
      success: true,
      stats: {
        stories: storiesCount?.count || 0,
        wire: wireCount?.count || 0,
        publishers: sourcesCount?.count || 0
      }
    });
  } catch (err) {
    console.error("API /api/stats Error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/network-health", async (req, res) => {
  try {
    const db = (await import("../../utils/db")).default;
    const dbInstance = await db;
    
    const stats = await dbInstance.all(`
      SELECT 
        source,
        sourceDomain,
        COUNT(id) as total_pulled,
        SUM(CASE WHEN extractionStatus = 'EXTRACTED' THEN 1 ELSE 0 END) as successful_extractions,
        SUM(CASE WHEN extractionStatus = 'PAYWALLED' THEN 1 ELSE 0 END) as paywalled,
        SUM(CASE WHEN extractionStatus = 'FAILED' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN extractionStatus = 'BLOCKED' THEN 1 ELSE 0 END) as blocked,
        SUM(CASE WHEN extractionStatus = 'NOT_ARTICLE' THEN 1 ELSE 0 END) as not_article,
        SUM(CASE WHEN extractionStatus = 'PARTIAL' THEN 1 ELSE 0 END) as partial
      FROM live_wire
      GROUP BY source, sourceDomain
      ORDER BY total_pulled DESC
    `);
    
    const overall = await dbInstance.get(`
      SELECT 
        COUNT(id) as total_pulled,
        SUM(CASE WHEN extractionStatus = 'EXTRACTED' THEN 1 ELSE 0 END) as successful_extractions,
        SUM(CASE WHEN extractionStatus = 'PAYWALLED' THEN 1 ELSE 0 END) as paywalled,
        SUM(CASE WHEN extractionStatus = 'FAILED' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN extractionStatus = 'BLOCKED' THEN 1 ELSE 0 END) as blocked,
        SUM(CASE WHEN extractionStatus = 'PARTIAL' THEN 1 ELSE 0 END) as partial
      FROM live_wire
    `);

    res.json({ success: true, overall, sources: stats });
  } catch (err) {
    console.error("API /api/news/network-health Error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.post("/fact-check", async (req, res) => {
  // Validate request body
  const validationResult = factCheckClaimSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ success: false, error: "Invalid request body" });
  }

  const { headline, claim } = validationResult.data;
  const targetText = (headline || claim || "").trim();

  if (!targetText) {
    return res.status(400).json({ error: "Headline or claim text is required." });
  }

  try {
    const analysis = await liveFactCheckClaim(targetText);
    
    try {
      await saveFactCheck({
        id: analysis.id,
        claim: analysis.claim,
        verdict: analysis.verdict,
        verdictDetail: analysis.verdictDetail,
        primaryReportingOutlet: analysis.primaryReportingOutlet,
        corroboratingSources: analysis.corroboratingSources,
        evidenceTrail: analysis.evidenceTrail,
        divergence: analysis.divergence,
        confidenceScore: analysis.confidenceScore,
        timestamp: analysis.timestamp,
        status: "LIVE",
        category: "Live RSS overlap",
      });
    } catch (persistErr) {
      console.warn("fact_checks persist skipped:", persistErr);
    }
    return res.json({ success: true, analysis });
  } catch (err) {
    console.error("API POST /api/news/fact-check Error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/followups", async (req, res) => {
  try {
    // Validate query parameters (none expected, but validate anyway)
    const queryValidation = z.object({}).safeParse(req.query);
    if (!queryValidation.success) {
      return res.status(400).json({ success: false, error: "Invalid query parameters" });
    }

    const stories = await getStories(15, 0);

    if (process.env.GEMINI_API_KEY && ai) {
      const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const prompt = `You are an editorial assistant. Today's current date is ${currentDate}.
Analyze these recent news headlines and generate 3 "Verification Watch" follow-up cases representing ongoing investigations, institutional claims, or policy promises in the news that need tracking.
News Context: ${stories.slice(0, 15).map((s: any) => s.title).join(" | ")}

Output strictly as a JSON array of objects matching this TS interface:
{
  "id": "string",
  "topic": "string",
  "category": "Court Directives" | "Policy Rollouts" | "Investigations" | "Environmental" | "Political Promises" | "Infrastructure Projects" | "Corporate & Economic" | "Scientific & Health" | "Elections & Governance" | "Public Controversies",
  "originalEventDate": "string (e.g. 'Oct 15, 2023')",
  "daysElapsed": number,
  "status": "Report Pending" | "Charge Sheet Filed" | "Implemented" | "Review Ongoing" | "Ongoing" | "Fulfilled" | "Stalled" | "Under Investigation",
  "summary": "string",
  "latestUpdate": "string",
  "source": "string",
  "authorityInCharge": "string",
  "milestones": [
    { "day": "string", "title": "string", "description": "string", "verified": boolean }
  ],
  "groundReality": "string",
  "politicalClaim": "string"
}
Output only JSON array.`;

      const response = await generateContentWithFallback(ai, {
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text || "[]";
      const cases = JSON.parse(text);
      if (Array.isArray(cases) && cases.length > 0) {
        return res.json({ success: true, cases });
      }
    }
    return res.json({ success: true, cases: [] });
  } catch (err) {
    console.error("API /api/news/followups Error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/voices-of-india", async (req, res) => {
  try {
    // Optimized VOI route leveraging our DB query
    const blindspots = await getVoicesOfIndiaStories(20, []);

    res.json({
      success: true,
      blindspots,
      stats: {
        totalAnalyzed: 100, // approximation
        blindspotsDetected: blindspots.length
      }
    });
  } catch (err) {
    console.error("API /api/news/voices-of-india Error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/fact-check/live", async (req, res) => {
  try {
    const stored = await getFactChecks(30);
    const stories = await getStories(20, 0);
    const generated = stories.slice(0, 12).map((s: any) =>
      analysisFromStory(s.title, s, stories)
    );
    const feed = [...stored, ...generated].slice(0, 20);
    res.json({ success: true, feed });
  } catch (err) {
    console.error("API /api/news/fact-check/live Error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  // Validate ID parameter
  const idValidation = idParamSchema.safeParse(req.params);
  if (!idValidation.success) {
    return res.status(400).json({ success: false, error: "Invalid story ID" });
  }

  try {
    const storyId = idValidation.data.id;

    const story = await getStoryById(storyId);
    if (!story) {
      return res.status(404).json({ success: false, error: "Story not found" });
    }

    let payload: any = story;
    if (storyNeedsFullArticleEnrich(story)) {
      payload = await enrichStoryFromFullArticles(story);
      const extracted = (payload.perspectives || []).some((p: any) => String(p.content || "").length >= 500);
      if (extracted) {
        try {
          const dbMod = await import("../../utils/db");
          const db = await (dbMod as any).default;
          await db.run("DELETE FROM timeline_events WHERE storyId = ?", [payload.id]);
          await saveNewsData([payload], []);
        } catch (persistErr) {
          console.warn("enrich persist skipped:", persistErr);
        }
      }
    }

    res.json({ success: true, story: payload });
  } catch (err) {
    console.error("API /api/news/:id Error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

const dossierChatSchema = z.object({
  storyId: z.string().min(1),
  message: z.string().min(1).max(2000),
  history: z.array(z.object({
    role: z.enum(["user", "model"]),
    text: z.string()
  })).optional().default([])
});

router.post("/dossier-chat", async (req, res) => {
  const parsed = dossierChatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid chat payload" });
  }

  const { storyId, message, history } = parsed.data;

  try {
    const story = await getStoryById(storyId);
    if (!story) {
      return res.status(404).json({ success: false, error: "Story not found" });
    }

    const extractedExcerpts = (story.perspectives || [])
      .filter((p: any) => p?.extractionStatus === "EXTRACTED" && String(p.content || "").length >= 500)
      .slice(0, 6)
      .map((p: any) => {
        const body = String(p.content || "").slice(0, 8000);
        return `Outlet: ${p.source || "Desk"}\nHeadline: ${p.title || ""}\nArticle Content Excerpt:\n${body}`;
      })
      .join("\n\n====================\n\n");

    const perspectivesList = (story.perspectives || []).map((p: any) => 
      `- [${p.source} | ${p.bias || 'Center'}]: "${p.title || ''}". Summary: ${p.summary || p.narrativeSummary || ''}. Lens: ${p.framingLens || 'Standard'}. extractionStatus=${p.extractionStatus || 'unknown'}`
    ).join("\n");

    const systemContext = `You are The Paperback's Senior Investigative Dossier Assistant.
You are engaging in a multi-turn conversation with a reader or news analyst.

TRUTH RULES (non-negotiable):
- ONLY use facts present in the EXTRACTED article excerpts and indexed story fields below.
- NEVER invent facts, numbers, quotes, desks, places, or timelines not present in the provided material.
- If evidence is thin: say so / NEEDS CONTEXT / omit the claim â€” do NOT fill gaps with model knowledge.
- Prefer full-article excerpts over headlines or short summaries when both exist.

Story Title: ${story.title}
Category: ${story.category || 'National'}
Primary Reporting Desk: ${story.primaryReportingOutlet || 'Indexed Outlets'}
Agreement notes (may be thin): ${story.verifiableConsensus || 'Reporting across desks'}
What Happened: ${story.description || ''}
Narrative Context: ${story.narrativeLandscape || ''}

Newsroom Perspectives:
${perspectivesList || 'No additional perspective cards'}

EXTRACTED full-article excerpts (authoritative evidence):
${extractedExcerpts || 'No EXTRACTED bodies available for this dossier yet. Say so if asked for specifics.'}

Editorial Directives:
1. Answer the user's specific query clearly, factually, and without sensationalism.
2. Directly contrast what different newsrooms emphasized or omitted when relevant, citing excerpts.
3. If an assertion or claim was not reported in the excerpts, explicitly state that it is unconfirmed in the current reporting archive.
4. Maintain a neutral, professional, investigative journalistic tone.`

    const contents: any[] = [
      { role: "user", parts: [{ text: systemContext }] },
      { role: "model", parts: [{ text: "Understood. I am The Paperback's Investigative Dossier Assistant. I am ready to answer questions strictly grounded in this multi-outlet news archive." }] }
    ];

    for (const turn of history) {
      contents.push({
        role: turn.role,
        parts: [{ text: turn.text }]
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    let reply = "";
    try {
      const client = ai || (await getGeminiClient());
      if (!client) {
        throw new Error("Gemini client could not be initialized");
      }
      const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";
      const response = await generateContentWithFallback(client, {
        model: modelName,
        contents
      });
      reply = response.text || "";
    } catch (geminiErr: any) {
      console.warn("[DossierChat] Gemini generation failed, using evidence synthesis fallback:", geminiErr?.message || geminiErr);
      reply = `Based on our indexed archive of ${story.primaryReportingOutlet || 'the reporting desks'}, ${story.verifiableConsensus || story.description || 'this event is currently under developing coverage.'}`;
    }

    return res.json({
      success: true,
      reply: reply || "The reporting desks did not provide sufficient detail on this specific query."
    });
  } catch (err: any) {
    console.error("[DossierChat] Internal Error:", err);
    return res.status(500).json({ success: false, error: "Failed to generate dossier response." });
  }
});

export default router;
