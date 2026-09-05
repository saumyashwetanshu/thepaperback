/**
 * Real token-classification NER via @xenova/transformers (same stack as MiniLM).
 *
 * Primary: Xenova/bert-base-multilingual-cased-ner-hrl (EN + HI / Devanagari).
 * Fallback model: Xenova/bert-base-NER (English).
 * Last resort: heuristicExtract (never labeled as transformers-ner / gliner).
 *
 * PAPERBACK_DISABLE_NER=1 forces heuristic only.
 * Failures never throw — ingest must not crash.
 */

import { heuristicExtract, type ExtractedEntity } from "./gliner.service.js";

const LOAD_TIMEOUT_MS = 90_000;
const INFER_CHAR_CAP = 1800;
const PRIMARY_MODEL = "Xenova/bert-base-multilingual-cased-ner-hrl";
const FALLBACK_MODEL = "Xenova/bert-base-NER";

export type NerEntity = ExtractedEntity & {
  source: "transformers-ner" | "heuristic";
};

let nerPipeline: any = null;
let nerInitPromise: Promise<any | null> | null = null;
let nerFailed = false;
let nerModelId: string | null = null;
let loggedDisable = false;

function xenovaInstalled(): boolean {
  try {
    if (typeof require !== "undefined" && typeof require.resolve === "function") {
      require.resolve("@xenova/transformers");
      return true;
    }
  } catch {
    /* ignore */
  }
  // Under tsx/ESM, require may be unavailable even when the package is present.
  // Optimistically return true; loadPipeline() will fail soft if missing.
  return true;
}

function nerDisabled(): boolean {
  return process.env.PAPERBACK_DISABLE_NER === "1";
}

function mapLabel(raw: string): string {
  const u = String(raw || "").toUpperCase().replace(/^B-|^I-|^E-|^S-/, "");
  if (u === "PER" || u === "PERSON") return "PERSON";
  if (u === "ORG" || u === "ORGANIZATION" || u === "ORGANISATION") return "ORGANIZATION";
  if (u === "LOC" || u === "LOCATION" || u === "GPE" || u === "PLACE") return "LOCATION";
  if (u === "MISC") return "MISC";
  if (u === "DATE") return "DATE";
  return u || "MISC";
}

function cleanWord(word: string): string {
  return String(word || "")
    .replace(/^##/, "")
    .replace(/\s+/g, " ")
    .replace(/^[,.\s]+|[,.\s]+$/g, "")
    .trim();
}

async function loadPipeline(modelId: string): Promise<any> {
  const { pipeline, env } = await import("@xenova/transformers");
  try {
    env.allowLocalModels = false;
  } catch {
    /* ignore */
  }
  return pipeline("token-classification", modelId, { quantized: true });
}

async function getNerPipeline(): Promise<any | null> {
  if (nerDisabled()) {
    if (!loggedDisable) {
      loggedDisable = true;
      console.warn("[NER] PAPERBACK_DISABLE_NER=1 — heuristic only");
    }
    return null;
  }
  if (nerFailed) return null;
  if (!xenovaInstalled()) {
    nerFailed = true;
    console.warn("[NER] @xenova/transformers not installed — heuristic fallback");
    return null;
  }
  if (nerPipeline) return nerPipeline;
  if (nerInitPromise) return nerInitPromise;

  nerInitPromise = (async () => {
    const tryLoad = async (modelId: string) => {
      console.log(`[NER] Loading token-classification model ${modelId}...`);
      const pipe = await loadPipeline(modelId);
      nerPipeline = pipe;
      nerModelId = modelId;
      console.log(`[NER] ready ${modelId} (source=transformers-ner)`);
      return pipe;
    };

    const load = (async () => {
      try {
        return await tryLoad(PRIMARY_MODEL);
      } catch (err) {
        console.warn(`[NER] primary model failed (${PRIMARY_MODEL}):`, err);
        try {
          return await tryLoad(FALLBACK_MODEL);
        } catch (err2) {
          nerFailed = true;
          console.warn(`[NER] fallback model failed (${FALLBACK_MODEL}):`, err2);
          return null;
        }
      }
    })();

    const timeout = new Promise<null>((resolve) => {
      setTimeout(() => {
        if (!nerPipeline) {
          nerFailed = true;
          console.warn("[NER] first-load timeout — heuristic fallback");
        }
        resolve(null);
      }, LOAD_TIMEOUT_MS);
    });

    const raced = await Promise.race([load, timeout]);
    // If timeout won but load later succeeds, prefer the loaded pipeline.
    if (nerPipeline) return nerPipeline;
    return raced;
  })().catch((err: unknown) => {
    nerFailed = true;
    console.warn("[NER] unexpected load error:", err);
    return null;
  });

  return nerInitPromise;
}

function mergeModelAndHeuristic(modelHits: NerEntity[], text: string): NerEntity[] {
  const out: NerEntity[] = [...modelHits];
  const seen = new Set(out.map((e) => e.normalizedText));
  for (const h of heuristicExtract(text)) {
    const key = h.normalizedText || h.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      ...h,
      source: "heuristic",
    });
  }
  return out;
}

/**
 * Run Xenova token-classification NER. On any failure, heuristic only.
 * source is 'transformers-ner' only when the model actually produced the span.
 */
function labelOf(row: any): string {
  return mapLabel(row.entity_group || row.entity || row.label || "");
}

function wordOf(row: any): { word: string; subword: boolean } {
  let word = String(row.word || row.text || "");
  const subword = word.startsWith("##");
  if (subword) word = word.slice(2);
  return { word, subword };
}

/** Merge only I- / ## continuations — never glue adjacent B- spans (Modi|Putin). */
function aggregateNerRows(raw: any[]): Array<{ entity_group: string; word: string; score: number }> {
  const items = (Array.isArray(raw) ? raw : []).slice().sort((a, b) => (a.start ?? a.index ?? 0) - (b.start ?? b.index ?? 0));
  const out: Array<{ entity_group: string; word: string; score: number; end?: number }> = [];
  for (const row of items) {
    const entity_group = labelOf(row);
    if (!entity_group || entity_group === "O") continue;
    const { word, subword } = wordOf(row);
    if (!word) continue;
    const score = Number(row.score ?? 0.75);
    const start = row.start;
    const end = row.end;
    const rawEnt = String(row.entity || row.label || "");
    const isInside =
      /^I-/i.test(rawEnt) ||
      subword ||
      (typeof start === "number" &&
        out.length > 0 &&
        typeof out[out.length - 1].end === "number" &&
        start === out[out.length - 1].end);
    const prev = out[out.length - 1];
    if (prev && prev.entity_group === entity_group && isInside) {
      prev.word =
        subword || (typeof start === "number" && typeof prev.end === "number" && start === prev.end)
          ? prev.word + word
          : `${prev.word} ${word}`;
      prev.score = Math.min(prev.score, score);
      if (typeof end === "number") prev.end = end;
    } else {
      out.push({ entity_group, word, score, end });
    }
  }
  return out.map(({ entity_group, word, score }) => ({ entity_group, word: cleanWord(word), score }));
}
export async function extractEntitiesTransformersNer(text: string): Promise<NerEntity[]> {
  const input = String(text || "").trim();
  if (!input) return [];

  try {
    const pipe = await getNerPipeline();
    if (!pipe) {
      return heuristicExtract(input).map((e) => ({ ...e, source: "heuristic" as const }));
    }

    const truncated = input.length > INFER_CHAR_CAP ? input.slice(0, INFER_CHAR_CAP) : input;
    const raw = await pipe(truncated, { aggregation_strategy: "simple" });
    const rows = aggregateNerRows(Array.isArray(raw) ? raw : []);

    const seen = new Set<string>();
    const modelHits: NerEntity[] = [];
    for (const row of rows) {
      const label = mapLabel(row.entity_group);
      if (label === "MISC" && Number(row.score || 0) < 0.85) continue;
      if (!["PERSON", "ORGANIZATION", "LOCATION", "DATE", "MISC"].includes(label)) continue;
      const word = cleanWord(row.word);
      if (word.length < 2) continue;
      const key = `${label}:${word.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      modelHits.push({
        text: word,
        normalizedText: word.toLowerCase(),
        type: label,
        confidence: Math.max(0, Math.min(1, Number(row.score ?? 0.75))),
        source: "transformers-ner",
      });
    }

    // Always top up with gazetteer/heuristic for Indian desks the model may miss,
    // but never relabel heuristic hits as transformers-ner.
    return mergeModelAndHeuristic(modelHits, input).slice(0, 80);
  } catch (err) {
    console.warn("[NER] inference failed — heuristic fallback:", err);
    return heuristicExtract(input).map((e) => ({ ...e, source: "heuristic" as const }));
  }
}

export function getNerModelId(): string | null {
  return nerModelId;
}