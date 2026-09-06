/**
 * Permanent honesty guards for The Paperback dossiers.
 * Applied on write (ingest) and read (API) so What Happened and desk cards
 * stay tied to the exact story — never outlet-count fluff or cross-wired summaries.
 */

const STOP = new Set(
  "the a an and or of to in on for from with by as at is was were be been being this that those these it its their his her they we you i not no but if than then also into over after before about against between during without within amid among across while will would can could should may might must has have had do did does".split(
    " "
  )
);

export function honestyTokens(s: string): string[] {
  return String(s || "")
    .toLowerCase()
    .split(/[^a-z0-9\u0900-\u097f]+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
}

export function isBoilerplateSummary(text: string): boolean {
  const t = String(text || "").trim();
  if (!t) return true;
  return (
    /^(corroborat|collaborat|cross[- ]?verif|verified (?:report|reporting|news dispatch)|reporting across|independent (?:regional )?reporting across)/i.test(
      t
    ) ||
    /\b(?:across|from) \d+\+?\s+(?:platforms?|desks?|outlets?|newsrooms?)\b/i.test(t) ||
    /\bcollaborat(?:ed|ion)? across\b/i.test(t) ||
    /\bcorroborat(?:ed|ion)? (?:by|across|from)\b/i.test(t)
  );
}

export function sanitizeWhatHappened(
  summary: string,
  fallbackBodies: string[] = [],
  title = ""
): string {
  const raw = String(summary || "").trim();
  if (raw && !isBoilerplateSummary(raw)) return raw.slice(0, 1200);
  for (const body of fallbackBodies) {
    const paras = String(body || "")
      .split(/\n+/)
      .map((x) => x.trim())
      .filter((x) => x.length > 40);
    const pick = (paras.slice(0, 2).join(" ") || String(body || "")).trim();
    if (pick.length >= 40 && !isBoilerplateSummary(pick)) return pick.slice(0, 1200);
  }
  const t = String(title || "").trim();
  return t ? `${t}.` : "";
}

function scrubPerspective(p: any): any {
  if (!p || typeof p !== "object") return p;
  const headline = String(p.title || "").trim();
  const summary = String(p.narrativeSummary || p.summary || "").trim();
  if (!headline || !summary || summary.length < 40) return p;
  const hToks = honestyTokens(headline);
  const sToks = new Set(honestyTokens(summary));
  const overlap = hToks.filter((t) => sToks.has(t)).length;
  const ratio = hToks.length ? overlap / hToks.length : 1;
  if (hToks.length >= 2 && ratio < 0.15) {
    return {
      ...p,
      narrativeSummary: `Reporting by ${p.source || "this desk"}: ${headline}`,
      framingLens: undefined,
    };
  }
  return p;
}

function sortTimeline(timeline: any[]): any[] {
  if (!Array.isArray(timeline) || timeline.length < 2) return timeline || [];
  return [...timeline].sort((a, b) => {
    const da = Date.parse(String(a?.date || ""));
    const db = Date.parse(String(b?.date || ""));
    if (isNaN(da) || isNaN(db)) return 0;
    return da - db;
  });
}

/** Match Gemini perspective enrichments by source+title when desks repeat. */
export function matchPerspectiveAi(aiList: any[], p: any): any | undefined {
  if (!Array.isArray(aiList) || !p) return undefined;
  const title = String(p.title || "").trim();
  const source = p.source;
  const exact = aiList.find(
    (ap) => ap.source === source && String(ap.title || "").trim() === title
  );
  if (exact) return exact;
  const sameSource = aiList.filter((ap) => ap.source === source);
  if (sameSource.length === 1) return sameSource[0];
  return undefined;
}

/**
 * Canonical story honesty pass — call before DB save and on API read.
 */
export function applyStoryHonesty(story: any, bodies: string[] = []): any {
  if (!story || typeof story !== "object") return story;
  const bodyList =
    bodies.length > 0
      ? bodies
      : (story.perspectives || [])
          .map((p: any) => String(p.content || p.extractedContent || ""))
          .filter(Boolean);

  story.description = sanitizeWhatHappened(
    String(story.description || story.summary || ""),
    bodyList,
    String(story.title || "")
  );
  if (story.summary) story.summary = story.description;

  if (Array.isArray(story.perspectives)) {
    story.perspectives = story.perspectives.map(scrubPerspective);
    // Unique desk labels for UI: dedupe identical source+title pairs keep both if titles differ
    const seen = new Set<string>();
    const outlets: string[] = [];
    for (const p of story.perspectives) {
      const key = String(p.source || "").trim();
      if (!key) continue;
      if (!seen.has(key)) {
        seen.add(key);
        outlets.push(key);
      }
    }
    if (typeof story.sourceCount === "number" && outlets.length > 0) {
      // Prefer unique outlet count for honesty labels when perspectives exist
      story.sourceCount = Math.max(outlets.length, story.independentReportingCount || 0);
    }
  }

  if (Array.isArray(story.timeline)) {
    story.timeline = sortTimeline(story.timeline);
  }

  return story;
}

export function applyStoriesHonesty(stories: any[]): any[] {
  if (!Array.isArray(stories)) return stories;
  return stories.map((s) => applyStoryHonesty(s));
}
