/**
 * Dense embeddings for The Paperback.
 *
 * Primary: Xenova/paraphrase-multilingual-MiniLM-L12-v2 (384-d, mean-pooled, L2-normalized).
 * Fallback: hashed subword TF-IDF-style 128-d vectors (never deleted).
 *
 * Lazy singleton. First load races a 60s timeout.
 * PAPERBACK_DISABLE_MINILM=1 forces the hashed stub.
 * Failures log and never throw — ingest must not crash.
 */

const FALLBACK_DIM = 128;
const LOAD_TIMEOUT_MS = 60_000;
const MODEL_ID = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";

function xenovaInstalled(): boolean {
  try {
    if (typeof require !== "undefined" && typeof require.resolve === "function") {
      require.resolve("@xenova/transformers");
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function hashStr(str: string, seed: number = 0): number {
  let h = seed ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0x5bd1e995);
    h ^= h >>> 15;
  }
  return h >>> 0;
}

/** Hashed subword TF-IDF-style embedding. Kept as the always-on fallback. */
function fallbackTfidfEmbed(text: string): number[] {
  if (!text || !text.trim()) return new Array(FALLBACK_DIM).fill(0);

  const clean = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
  const words = clean.split(/\s+/).filter((w) => w.length > 1);
  if (words.length === 0) return new Array(FALLBACK_DIM).fill(0);

  const vector = new Float64Array(FALLBACK_DIM);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wHash = hashStr(word, 42) % FALLBACK_DIM;
    vector[wHash] += 1.5;

    const padded = `^${word}$`;
    for (let j = 0; j < padded.length - 2; j++) {
      const trigram = padded.slice(j, j + 3);
      const tHash = hashStr(trigram, 101) % FALLBACK_DIM;
      vector[tHash] += 0.8;
    }

    if (i < words.length - 1) {
      const bigram = `${word}_${words[i + 1]}`;
      const bHash = hashStr(bigram, 73) % FALLBACK_DIM;
      vector[bHash] += 1.2;
    }
  }

  let norm = 0;
  for (let i = 0; i < FALLBACK_DIM; i++) {
    norm += vector[i] * vector[i];
  }

  if (norm > 0) {
    const sqrtNorm = Math.sqrt(norm);
    const result: number[] = new Array(FALLBACK_DIM);
    for (let i = 0; i < FALLBACK_DIM; i++) {
      result[i] = Number((vector[i] / sqrtNorm).toFixed(6));
    }
    return result;
  }

  return new Array(FALLBACK_DIM).fill(0);
}

let extractorPromise: Promise<any | null> | null = null;
let minilmFailed = false;
let loggedDisable = false;

function minilmDisabled(): boolean {
  return process.env.PAPERBACK_DISABLE_MINILM === "1";
}

async function getMiniLMExtractor(): Promise<any | null> {
  if (minilmDisabled()) {
    if (!loggedDisable) {
      loggedDisable = true;
      console.warn("[MiniLM] PAPERBACK_DISABLE_MINILM=1 — using hashed TF-IDF fallback");
    }
    return null;
  }
  if (minilmFailed) return null;
  if (!xenovaInstalled()) {
    minilmFailed = true;
    console.warn("[MiniLM] @xenova/transformers not in node_modules — using hashed TF-IDF fallback");
    return null;
  }
  if (extractorPromise) return extractorPromise;

  extractorPromise = (async () => {
    const load = (async () => {
      const { pipeline, env } = await import("@xenova/transformers");
      try {
        env.allowLocalModels = false;
      } catch {
        /* ignore env poke failures */
      }
      return await pipeline("feature-extraction", MODEL_ID, { quantized: true });
    })().catch((err: unknown) => {
      minilmFailed = true;
      console.warn("[MiniLM] load failed:", err);
      return null;
    });

    const timeout = new Promise<null>((resolve) => {
      setTimeout(() => {
        minilmFailed = true;
        console.warn("[MiniLM] first-load timeout (60s) — using hashed TF-IDF fallback");
        resolve(null);
      }, LOAD_TIMEOUT_MS);
    });

    const extractor = await Promise.race([load, timeout]);
    if (!extractor) return null;
    console.log(`[MiniLM] ready ${MODEL_ID} (384-d)`);
    return extractor;
  })().catch((err: unknown) => {
    minilmFailed = true;
    console.warn("[MiniLM] unexpected load error:", err);
    return null;
  });

  return extractorPromise;
}

/** MiniLM path. On any failure returns [] and logs — never throws. */
async function embedMiniLM(text: string): Promise<number[]> {
  try {
    const extractor = await getMiniLMExtractor();
    if (!extractor) return [];
    const truncated = text.length > 2000 ? text.slice(0, 2000) : text;
    const output = await extractor(truncated, { pooling: "mean", normalize: true });
    const raw = output?.data ?? output?.tolist?.()?.[0];
    if (raw == null) {
      console.warn("[MiniLM] empty output — using fallback");
      return [];
    }
    const vec: number[] = Array.isArray(raw)
      ? raw.map(Number)
      : Array.from(raw as ArrayLike<number>, Number);
    if (!vec.length) {
      console.warn("[MiniLM] empty vector — using fallback");
      return [];
    }
    return vec;
  } catch (err) {
    console.warn("[MiniLM] inference failed:", err);
    return [];
  }
}

export async function embedHeadline(text: string): Promise<number[]> {
  try {
    const dense = await embedMiniLM(text || "");
    if (dense.length > 0) return dense;
    return fallbackTfidfEmbed(text || "");
  } catch (err) {
    console.warn("[MiniLM] embedHeadline caught:", err);
    return fallbackTfidfEmbed(text || "");
  }
}
