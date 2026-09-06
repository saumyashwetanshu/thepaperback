import { Router } from "express";
import { getGeminiClient } from "../services/secrets.service";
import { generateContentWithFallback } from "../services/gemini.service";

const router = Router();

const LANG_NAME: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  kn: "Kannada",
  ml: "Malayalam",
};

function hasIndic(s: string): boolean {
  return /[\u0900-\u097F\u0980-\u09FF\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]/.test(s);
}

async function translateOne(text: string, targetLang: string): Promise<string> {
  const trimmed = String(text || "").trim();
  if (!trimmed) return trimmed;
  const targetName = LANG_NAME[targetLang] || "English";

  // Skip if already in target script for en/hi common cases
  if (targetLang === "en" && !hasIndic(trimmed)) return trimmed;
  if (targetLang === "hi" && hasIndic(trimmed) && /[\u0900-\u097F]/.test(trimmed)) return trimmed;

  const ai = await getGeminiClient();
  if (!ai) return trimmed;

  const prompt = `You are a precise news translator for The Paperback (India news).
Translate the following text into ${targetName}.

RULES:
- Stay factual and literal to the source meaning. Do NOT invent facts, names, numbers, or spin.
- Keep proper nouns (people, places, orgs) accurate.
- Preserve tone of news reporting; no marketing language.
- Output ONLY the translation, no quotes, no preamble.

TEXT:
${trimmed.slice(0, 4000)}`;

  try {
    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const response = await generateContentWithFallback(ai, {
      model: modelName,
      contents: prompt,
    });
    const out = String(response?.text || "").trim();
    return out || trimmed;
  } catch {
    return trimmed;
  }
}

router.post("/", async (req, res) => {
  try {
    const targetLang = String(req.body?.targetLang || "en");
    if (Array.isArray(req.body?.texts)) {
      const texts = req.body.texts.map((t: any) => String(t || ""));
      const translations: string[] = [];
      // sequential to protect quota; small batches from UI
      for (const t of texts.slice(0, 12)) {
        translations.push(await translateOne(t, targetLang));
      }
      return res.json({ success: true, translations });
    }
    const text = String(req.body?.text || "");
    const translation = await translateOne(text, targetLang);
    return res.json({ success: true, translation });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || "translate failed" });
  }
});


router.post("/desk-audit", async (req, res) => {
  try {
    const source = String(req.body?.source || "This desk");
    const headline = String(req.body?.headline || "").trim();
    const summary = String(req.body?.summary || "").trim();
    const excerpt = String(req.body?.excerpt || "").trim().slice(0, 3500);
    const targetLang = String(req.body?.targetLang || "en");
    const langName = LANG_NAME[targetLang] || "English";

    if (!headline && !summary && !excerpt) {
      return res.status(400).json({ success: false, error: "nothing to audit" });
    }

    const ai = await getGeminiClient();
    if (!ai) {
      return res.status(503).json({ success: false, error: "translator unavailable" });
    }

    const prompt = `You are a senior India news media editor at The Paperback.
Audit ONE newsroom's coverage of a story. Write in ${langName}.

Newsroom: ${source}
Headline: ${headline || "(none)"}
Coverage summary: ${summary || "(none)"}
Article extract (may be partial):
${excerpt || "(no extract)"}

Return STRICT JSON only (no markdown):
{
  "framing": "2-4 full sentences. What angle this desk chose, what it emphasizes for a reader, in plain language. No buzzwords.",
  "strategy": "2-4 full sentences. How the piece is built (lead, who is quoted, what stakes are centered).",
  "shortcomings": "2-4 full sentences. Concrete gaps: missing context, missing stakeholders, thin evidence, unverified claims, or extract limits. If extract is thin, say that honestly instead of inventing omissions."
}

HARD RULES:
- Factual. Only grounded in the headline/summary/extract above.
- Never invent facts, numbers, quotes, or agencies not present.
- Never output comma-separated keyword lists.
- Never use templates like "frames this through a X lens", "what it elevates versus", "Emphasis cluster", "Reporting strategy reads as".
- Never say "AI" or "as a language model".
- If evidence is thin, say so in shortcomings — do not fake a deep audit.`;

    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const response = await generateContentWithFallback(ai, {
      model: modelName,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    let text = String(response?.text || "").trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```json?\s*/i, "").replace(/```$/i, "").trim();
    }
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(502).json({ success: false, error: "bad audit payload" });
    }

    const framing = String(parsed.framing || "").trim();
    const strategy = String(parsed.strategy || "").trim();
    const shortcomings = String(parsed.shortcomings || "").trim();

    const bad = (s: string) =>
      !s ||
      s.length < 40 ||
      /Emphasis cluster|frames this through a|what it elevates versus|Reporting strategy reads as/i.test(s) ||
      ((s.match(/,/g) || []).length >= 4 && !/[.?!]/.test(s));

    if (bad(framing) && bad(strategy) && bad(shortcomings)) {
      return res.status(502).json({ success: false, error: "audit too thin" });
    }

    return res.json({
      success: true,
      framing: bad(framing) ? null : framing,
      strategy: bad(strategy) ? null : strategy,
      shortcomings: bad(shortcomings) ? null : shortcomings,
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || "desk-audit failed" });
  }
});

export default router;
