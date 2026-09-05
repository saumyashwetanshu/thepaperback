export function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  let val = text
    .replace(/&#160;|&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10));
      } catch {
        return " ";
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return " ";
      }
    })
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

  if (typeof document !== "undefined") {
    try {
      const textArea = document.createElement("textarea");
      textArea.innerHTML = val;
      val = textArea.value || val;
    } catch {
      // fallback
    }
  }

  return val;
}

export function cleanDescriptionText(text: string): string {
  if (!text) return "";
  let clean = decodeHtmlEntities(text);
  return clean
    .replace(/The post .*? appeared first on .*/gi, "")
    .replace(/\[\s*\.\.\.\s*\]/g, "")
    .replace(/\s*Read more\s*\.?/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Produces an executive, factual summary of a newsroom's version of the story.
 * Strictly capped at maxWords (default 45-50 words).
 */
export function summarizeNewsroomAccount(text: string | undefined, maxWords = 48): string {
  if (!text) return "";
  const cleaned = cleanDescriptionText(text);
  if (!cleaned) return "";

  const words = cleaned.split(/\s+/);
  if (words.length <= maxWords) {
    return cleaned;
  }

  // Attempt to stop at the first complete sentence if it finishes within maxWords
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 0) {
    let accumulated = "";
    for (const sentence of sentences) {
      const candidate = (accumulated ? accumulated + " " : "") + sentence.trim();
      const count = candidate.split(/\s+/).length;
      if (count <= maxWords) {
        accumulated = candidate;
      } else {
        break;
      }
    }
    if (accumulated && accumulated.split(/\s+/).length >= 15) {
      return accumulated;
    }
  }

  // Fallback: Slice cleanly at word boundary under maxWords with ellipsis
  return words.slice(0, maxWords).join(" ").replace(/[,;:\-\s]+$/, "") + "...";
}
