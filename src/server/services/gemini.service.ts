/**
 * Gemini generateContent with model fallback ladder for Cloud Run AI challenge.
 * Tries models in order on 503 / 429 / 404 / 500 (and similar transient failures).
 */
export const GEMINI_FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash",
] as const;

function isRetryableGeminiError(err: unknown): boolean {
  const anyErr = err as any;
  const status =
    anyErr?.status ??
    anyErr?.statusCode ??
    anyErr?.code ??
    anyErr?.error?.code ??
    anyErr?.response?.status;
  const msg = String(anyErr?.message || anyErr || "").toLowerCase();
  if ([503, 429, 404, 500].includes(Number(status))) return true;
  if (msg.includes("503") || msg.includes("429") || msg.includes("404") || msg.includes("500")) return true;
  if (msg.includes("unavailable") || msg.includes("resource_exhausted") || msg.includes("not found")) return true;
  if (msg.includes("overloaded") || msg.includes("try again")) return true;
  return false;
}

export type GenerateContentArgs = {
  model?: string;
  contents: any;
  config?: any;
};

/**
 * Call ai.models.generateContent, walking the fallback ladder on retryable errors.
 */
export async function generateContentWithFallback(
  ai: { models: { generateContent: (args: any) => Promise<any> } },
  args: GenerateContentArgs
): Promise<any> {
  const preferred = args.model || process.env.GEMINI_MODEL || GEMINI_FALLBACK_MODELS[0];
  const ladder = [preferred, ...GEMINI_FALLBACK_MODELS.filter((m) => m !== preferred)];
  let lastError: unknown;

  for (const model of ladder) {
    try {
      const response = await ai.models.generateContent({
        ...args,
        model,
      });
      if (model !== preferred) {
        console.warn(`[GeminiFallback] Succeeded with fallback model: ${model}`);
      }
      return response;
    } catch (err) {
      lastError = err;
      if (isRetryableGeminiError(err)) {
        console.warn(`[GeminiFallback] Model ${model} failed (retryable); trying next.`, (err as any)?.message || err);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}
