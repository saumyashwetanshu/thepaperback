import React, { useEffect, useMemo, useState } from "react";
import type { NewsStory, Perspective } from "../../types";
import { summarizeNewsroomAccount, decodeHtmlEntities } from "../../utils/decode";
import { useLanguage } from "../../context/LanguageContext";
import { translateTextsBatch, textNeedsTranslation, hasIndicScript } from "../../data/newsTranslator";

function cleanSourceName(source?: string): string {
  if (!source) return "News desk";
  return source
    .replace(/\s*\(HTML\)/gi, "")
    .replace(/\s*\(RSS\)/gi, "")
    .replace(/\s*\[RSS\]/gi, "")
    .replace(/\s*Feed$/gi, "")
    .trim();
}

function cleanText(s?: string): string {
  return decodeHtmlEntities(String(s || ""))
    .replace(/\s+/g, " ")
    .trim();
}

function isKeywordDump(s: string): boolean {
  const t = cleanText(s);
  if (!t) return true;
  const words = t.split(/[\s,;|/]+/).filter(Boolean);
  if (words.length >= 4) {
    const avg = words.reduce((n, w) => n + w.length, 0) / words.length;
    const commaHeavy = (t.match(/,/g) || []).length >= 3;
    const noSentence = !/[.?!]/.test(t) && t.length < 160;
    if ((commaHeavy || avg <= 8) && noSentence) return true;
  }
  return false;
}

function isTemplateFraming(s: string): boolean {
  return /frames this through a .+ lens|what it elevates versus what it leaves aside|Reporting strategy reads as|Emphasis cluster:|costume framing|clearest signal is its own headline/i.test(
    s
  );
}

function isHeadlineEcho(summary: string, headline: string, source: string): boolean {
  const s = cleanText(summary).toLowerCase();
  const h = cleanText(headline).toLowerCase();
  if (!s || !h) return true;
  if (/^reporting by\s+/i.test(summary) && s.includes(h.slice(0, Math.min(40, h.length)))) return true;
  const snorm = s.replace(/[^a-z0-9\u0900-\u097f]+/g, "");
  const hnorm = h.replace(/[^a-z0-9\u0900-\u097f]+/g, "");
  if (hnorm.length > 20 && (snorm === hnorm || snorm.includes(hnorm) || hnorm.includes(snorm))) {
    if (Math.abs(snorm.length - hnorm.length) < 24) return true;
  }
  const src = cleanSourceName(source).toLowerCase();
  if (s.startsWith(`reporting by ${src}`) && s.length < h.length + 40) return true;
  return false;
}

function isUsefulProse(s: string): boolean {
  const t = cleanText(s);
  if (t.length < 48) return false;
  if (isKeywordDump(t)) return false;
  if (isTemplateFraming(t)) return false;
  return t.split(/\s+/).filter(Boolean).length >= 10;
}

function scorePerspective(p: Perspective): number {
  let score = 0;
  const summary = cleanText(p.narrativeSummary || p.leadParagraph || "");
  score += Math.min(summary.length, 800);
  if (p.extractionStatus === "EXTRACTED") score += 400;
  else if (p.extractionStatus === "PARTIAL") score += 120;
  if (p.url) score += 20;
  if (!/[\u0900-\u097F]/.test(summary + (p.title || ""))) score += 80;
  if (isUsefulProse(summary)) score += 200;
  return score;
}

function uniqueDesks(list: Perspective[]): Perspective[] {
  const best = new Map<string, Perspective>();
  for (const p of list) {
    const key = cleanSourceName(p.source).toLowerCase();
    const prev = best.get(key);
    if (!prev || scorePerspective(p) > scorePerspective(prev)) best.set(key, p);
  }
  return Array.from(best.values());
}

function coverageSummary(p: Perspective, headline: string): string | null {
  const source = cleanSourceName(p.source);
  const candidates = [p.narrativeSummary, p.leadParagraph, p.standfirst, p.quote, (p as any).content]
    .map((x) => cleanText(x))
    .filter(Boolean);

  for (const c of candidates) {
    if (isHeadlineEcho(c, headline, source)) continue;
    if (isKeywordDump(c)) continue;
    if (c.length < 48) continue;
    const clipped = c.length > 340 ? `${c.slice(0, 337).trim()}…` : c;
    if (isHeadlineEcho(clipped, headline, source)) continue;
    return clipped;
  }

  const soft = summarizeNewsroomAccount(
    String(p.narrativeSummary || p.leadParagraph || p.quote || ""),
    72
  );
  if (soft && !isHeadlineEcho(soft, headline, source) && soft.length >= 48) return soft;
  return null;
}

function storedFraming(p: Perspective): string | null {
  const candidates = [p.framingLens, p.editorialFraming, p.framingStrategy]
    .map((x) => cleanText(x))
    .filter(Boolean);
  for (const c of candidates) {
    if (isKeywordDump(c) || isTemplateFraming(c) || !isUsefulProse(c)) continue;
    return c.length > 280 ? `${c.slice(0, 277).trim()}…` : c;
  }
  return null;
}

type DeskAudit = {
  framing: string | null;
  strategy: string | null;
  shortcomings: string | null;
};

async function fetchDeskAudit(payload: {
  source: string;
  headline: string;
  summary: string;
  excerpt: string;
  targetLang: string;
  signal?: AbortSignal;
}): Promise<DeskAudit | null> {
  try {
    const res = await fetch("/api/translate/desk-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: payload.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.success) return null;
    return {
      framing: data.framing || null,
      strategy: data.strategy || null,
      shortcomings: data.shortcomings || null,
    };
  } catch {
    return null;
  }
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeskCard({ p, storyTitle }: { p: Perspective; storyTitle: string }) {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [openDenoiser, setOpenDenoiser] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [audit, setAudit] = useState<DeskAudit | null>(null);

  const source = cleanSourceName(p.source);
  const baseHeadline = cleanText(p.title || storyTitle);
  const baseSummary = coverageSummary(p, baseHeadline);
  const baseFraming = storedFraming(p);
  const excerpt = cleanText((p as any).content || p.leadParagraph || p.narrativeSummary || "").slice(0, 3500);
  const wasIndic = hasIndicScript(baseHeadline + " " + (baseSummary || ""));

  const [headline, setHeadline] = useState(baseHeadline);
  const [summary, setSummary] = useState(baseSummary);
  const [framing, setFraming] = useState(baseFraming);

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();
    const inputs = [baseHeadline, baseSummary || "", baseFraming || ""];
    const needs = inputs.some((t) => t && textNeedsTranslation(t, language));
    if (!needs) {
      setHeadline(baseHeadline);
      setSummary(baseSummary);
      setFraming(baseFraming);
      setBusy(false);
      return;
    }
    setBusy(true);
    (async () => {
      const out = await translateTextsBatch(inputs, language, ac.signal);
      if (cancelled) return;
      setHeadline(out[0] || baseHeadline);
      setSummary(baseSummary ? out[1] || baseSummary : null);
      setFraming(baseFraming ? out[2] || baseFraming : null);
      setBusy(false);
    })();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [language, baseHeadline, baseSummary, baseFraming]);

  useEffect(() => {
    setAudit(null);
    setAuditError(null);
    setOpenDenoiser(false);
  }, [language, source, baseHeadline]);

  async function toggleDenoiser() {
    if (openDenoiser) {
      setOpenDenoiser(false);
      return;
    }
    setOpenDenoiser(true);
    if (audit || auditLoading) return;
    setAuditLoading(true);
    setAuditError(null);
    const result = await fetchDeskAudit({
      source,
      headline: headline || baseHeadline,
      summary: summary || baseSummary || "",
      excerpt,
      targetLang: language,
    });
    setAuditLoading(false);
    if (!result || (!result.strategy && !result.shortcomings && !result.framing)) {
      setAuditError("Not enough extract yet for a useful framing read.");
      return;
    }
    setAudit(result);
    if (!framing && result.framing) setFraming(result.framing);
  }

  const url = p.url || "";
  const faceFraming = framing || audit?.framing || null;
  const langHint =
    language === "en" && wasIndic
      ? "From Hindi"
      : language === "hi" && !wasIndic && /[A-Za-z]{4,}/.test(baseHeadline)
        ? "अंग्रेज़ी से"
        : null;

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-black/[0.1] hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.14)] dark:border-white/[0.08] dark:bg-[#0c0c0e] dark:hover:border-white/[0.14] dark:hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)]">
      {/* quiet top hairline accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className={`flex flex-1 flex-col px-5 pb-5 pt-5 md:px-6 md:pb-6 md:pt-6 ${busy ? "opacity-75" : ""}`}>
        {/* masthead */}
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" aria-hidden />
            <p className="truncate text-[12px] font-sans font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
              {source}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {langHint ? (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {langHint}
              </span>
            ) : null}
            {busy ? (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-600" aria-hidden />
            ) : null}
          </div>
        </div>

        {/* headline — primary */}
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="font-serif text-[22px] font-bold leading-[1.22] tracking-[-0.025em] text-zinc-950 transition-colors hover:text-rose-700 dark:text-zinc-50 dark:hover:text-rose-400 md:text-[24px]"
          >
            {headline}
          </a>
        ) : (
          <h3 className="font-serif text-[22px] font-bold leading-[1.22] tracking-[-0.025em] text-zinc-950 dark:text-zinc-50 md:text-[24px]">
            {headline}
          </h3>
        )}

        {/* narrative summary — soft paper well */}
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-sans font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
            Narrative summary
          </p>
          <div className="rounded-xl bg-zinc-50/90 px-4 py-3.5 dark:bg-zinc-900/60">
            <p
              className={`text-[15px] leading-[1.65] ${
                summary
                  ? "text-zinc-700 dark:text-zinc-300"
                  : "italic text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {summary ||
                "No separate summary beyond the headline in our extract — open the original for the full piece."}
            </p>
          </div>
        </div>

        {/* framing lens — pull-quote feel */}
        {faceFraming ? (
          <div className="mt-4 border-l-2 border-rose-500/50 pl-3.5">
            <p className="mb-1.5 text-[10px] font-sans font-semibold uppercase tracking-[0.16em] text-rose-600/80 dark:text-rose-400/90">
              The framing lens
            </p>
            <p className="font-serif text-[15px] italic leading-[1.55] text-zinc-600 dark:text-zinc-400">
              {faceFraming}
            </p>
          </div>
        ) : null}

        {/* narrative de-noiser */}
        <div className="mt-5">
          <button
            type="button"
            onClick={toggleDenoiser}
            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left transition-colors duration-200 ${
              openDenoiser
                ? "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                : "bg-transparent text-rose-700 hover:bg-rose-50/80 dark:text-rose-400 dark:hover:bg-rose-950/30"
            }`}
            aria-expanded={openDenoiser}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
              {openDenoiser ? "Hide analysis" : "Narrative de-noiser"}
            </span>
            <Chevron open={openDenoiser} />
          </button>

          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
              openDenoiser ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="mt-2 space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                {auditLoading ? (
                  <div className="flex items-center gap-2.5 py-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
                    <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400">
                      Reading the extract for framing and gaps…
                    </p>
                  </div>
                ) : null}

                {auditError && !auditLoading ? (
                  <p className="text-[13.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {auditError}
                  </p>
                ) : null}

                {audit?.strategy ? (
                  <div>
                    <p className="mb-1.5 text-[10px] font-sans font-semibold uppercase tracking-[0.14em] text-zinc-400">
                      Framing strategy
                    </p>
                    <p className="text-[14.5px] leading-[1.6] text-zinc-800 dark:text-zinc-200">
                      {audit.strategy}
                    </p>
                  </div>
                ) : null}

                {audit?.strategy && audit?.shortcomings ? (
                  <div className="h-px bg-zinc-200/80 dark:bg-zinc-700/60" />
                ) : null}

                {audit?.shortcomings ? (
                  <div>
                    <p className="mb-1.5 text-[10px] font-sans font-semibold uppercase tracking-[0.14em] text-rose-600/80 dark:text-rose-400/90">
                      Narrative discrepancies
                    </p>
                    <p className="text-[14.5px] leading-[1.6] text-zinc-800 dark:text-zinc-200">
                      {audit.shortcomings}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* footer actions */}
        <div className="mt-auto flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
          {url ? (
            <>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 hover:text-rose-700 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-rose-400"
              >
                Read story
                <span aria-hidden className="text-[11px] opacity-60">
                  ↗
                </span>
              </a>
              <span className="text-zinc-200 dark:text-zinc-700" aria-hidden>
                ·
              </span>
              <button
                type="button"
                onClick={copyLink}
                className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                {copied ? "Copied" : "Copy link"}
              </button>
            </>
          ) : (
            <span className="px-2.5 py-1.5 text-[12px] text-zinc-400">Original unavailable</span>
          )}
        </div>
      </div>
    </article>
  );
}

export function CoverageComparisonMatrix({ story }: { story: NewsStory }) {
  const desks = useMemo(
    () => uniqueDesks(Array.isArray(story.perspectives) ? story.perspectives : []),
    [story.perspectives]
  );
  if (desks.length < 1) return null;

  return (
    <section id="matrix" className="flex flex-col gap-7">
      <header className="border-b border-zinc-200/90 pb-5 dark:border-zinc-800">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1.5 text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-500">
              From the desks
            </p>
            <h2 className="font-serif text-[28px] font-bold leading-tight tracking-[-0.025em] text-zinc-950 dark:text-zinc-50 md:text-[34px]">
              How each newsroom led it
            </h2>
          </div>
          <p className="pb-1 text-[12px] font-medium tabular-nums text-zinc-400 dark:text-zinc-500">
            {desks.length} {desks.length === 1 ? "desk" : "desks"}
          </p>
        </div>
        <p className="max-w-2xl text-[14.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          Headline and narrative first. Open Narrative de-noiser for framing strategy and gaps.
          Language follows the toggle above.
        </p>
      </header>

      <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 md:gap-6">
        {desks.map((p) => (
          <DeskCard key={cleanSourceName(p.source)} p={p} storyTitle={story.title} />
        ))}
      </div>
    </section>
  );
}