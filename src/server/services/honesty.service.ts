/**
 * Permanent honesty guards for The Paperback dossiers.
 * Applied on write (ingest) and read (API) so What Happened and desk cards
 * stay tied to the exact story - never outlet-count fluff or cross-wired summaries.
 */

const STOP = new Set(
  "the a an and or of to in on for from with by as at is was were be been being this that those these it its their his her they we you i not no but if than then also into over after before about against between during without within amid among across while will would can could should may might must has have had do did does live breaking exclusive watch update".split(
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

export function isPlaceholderHeadline(text: string): boolean {
  return /this is a real headline|not ai-generated|lorem ipsum|sample headline|dummy headline|placeholder/i.test(
    String(text || "").trim()
  );
}

export function tokenOverlapRatio(a: string, b: string): number {
  const aToks = honestyTokens(a);
  const bSet = new Set(honestyTokens(b));
  if (aToks.length === 0 || bSet.size === 0) return 0;
  const hit = aToks.filter((t) => bSet.has(t)).length;
  return hit / aToks.length;
}

export function sanitizeWhatHappened(
  summary: string,
  fallbackBodies: string[] = [],
  title = ""
): string {
  const raw = String(summary || "").trim();
  if (raw && !isBoilerplateSummary(raw) && !isPlaceholderHeadline(raw)) return raw.slice(0, 1200);
  for (const body of fallbackBodies) {
    const paras = String(body || "")
      .split(/\n+/)
      .map((x) => x.trim())
      .filter((x) => x.length > 40);
    const pick = (paras.slice(0, 2).join(" ") || String(body || "")).trim();
    if (pick.length >= 40 && !isBoilerplateSummary(pick) && !isPlaceholderHeadline(pick)) return pick.slice(0, 1200);
  }
  const t = String(title || "").trim();
  if (t && !isPlaceholderHeadline(t)) return `${t}.`;
  return "";
}

function scrubPerspective(p: any): any {
  if (!p || typeof p !== "object") return p;
  const headline = String(p.title || "").trim();
  if (isPlaceholderHeadline(headline)) {
    return { ...p, title: "", narrativeSummary: "", framingLens: undefined };
  }
  const summary = String(p.narrativeSummary || p.summary || "").trim();
  if (!headline || !summary || summary.length < 40) return p;
  const hToks = honestyTokens(headline);
  const sToks = new Set(honestyTokens(summary));
  const overlap = hToks.filter((t) => sToks.has(t)).length;
  const ratio = hToks.length ? overlap / hToks.length : 1;
  // Do not invent "Reporting by..." stubs - leave summary empty if mismatched
  if (hToks.length >= 2 && ratio < 0.15) {
    return { ...p, framingLens: undefined };
  }
  return p;
}

export function filterSameEventPerspectives(story: any): any[] {
  const list = Array.isArray(story?.perspectives) ? story.perspectives : [];
  if (list.length <= 1) return list;

  const title = String(story.title || "");
  const desc = String(story.description || story.summary || "");
  const anchor = desc.length > 60 ? `${desc} ${title}` : `${title} ${desc}`;

  const usable = list.filter((p) => {
    const t = String(p?.title || "").trim();
    return t && !isPlaceholderHeadline(t);
  });
  if (usable.length === 0) return [];

  const kept = usable.filter((p) => {
    const blob = [
      String(p.title || ""),
      String(p.narrativeSummary || ""),
      String(p.content || "").slice(0, 800),
    ].join(" ");
    return (
      tokenOverlapRatio(String(p.title || ""), anchor) >= 0.28 ||
      tokenOverlapRatio(blob, anchor) >= 0.22 ||
      tokenOverlapRatio(anchor, blob) >= 0.28
    );
  });

  if (kept.length === 0) {
    const scored = usable
      .map((p) => ({ p, s: tokenOverlapRatio(String(p.title || ""), anchor) }))
      .sort((a, b) => b.s - a.s);
    return scored[0]?.s > 0 ? [scored[0].p] : usable.slice(0, 1);
  }
  return kept;
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

/** Match Gemini perspective enrichments by source+title. Never source-only when titles differ. */
export function matchPerspectiveAi(aiList: any[], p: any): any | undefined {
  if (!Array.isArray(aiList) || !p) return undefined;
  const title = String(p.title || "").trim();
  const source = p.source;
  const exact = aiList.find(
    (ap) => ap.source === source && String(ap.title || "").trim() === title
  );
  if (exact) return exact;
  const sameSource = aiList.filter((ap) => ap.source === source);
  if (sameSource.length === 1) {
    const only = sameSource[0];
    const aiTitle = String(only.title || "").trim();
    if (!aiTitle || !title) return undefined;
    if (tokenOverlapRatio(title, aiTitle) >= 0.4 || tokenOverlapRatio(aiTitle, title) >= 0.4) {
      return only;
    }
    return undefined;
  }
  return sameSource.find((ap) => tokenOverlapRatio(title, String(ap.title || "")) >= 0.45);
}

/**
 * Canonical story honesty pass - call before DB save and on API read.
 * Does NOT rewrite story.title (avoids contest hallucinations).
 */
export function applyStoryHonesty(story: any, bodies: string[] = []): any {
  if (!story || typeof story !== "object") return story;
  const bodyList =
    bodies.length > 0
      ? bodies
      : (story.perspectives || [])
          .map((p: any) => String(p.content || p.extractedContent || ""))
          .filter(Boolean);

  if (isPlaceholderHeadline(String(story.title || "")) && Array.isArray(story.perspectives)) {
    const fallback = story.perspectives
      .map((p: any) => String(p?.title || "").trim())
      .find((t: string) => t && !isPlaceholderHeadline(t));
    if (fallback) story.title = fallback;
  }

  story.description = sanitizeWhatHappened(
    String(story.description || story.summary || ""),
    bodyList,
    String(story.title || "")
  );
  if (story.summary) story.summary = story.description;

  if (Array.isArray(story.perspectives)) {
    story.perspectives = filterSameEventPerspectives(story).map(scrubPerspective);
    const seen = new Set<string>();
    const outlets: string[] = [];
    for (const p of story.perspectives) {
      const key = String(p.source || "").trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      outlets.push(String(p.source || "").trim());
    }
    story.sourceCount = outlets.length;
    story.independentReportingCount = outlets.length;
    if (outlets.length > 0) story.primaryReportingOutlet = outlets[0];
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
