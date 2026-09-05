import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export interface ExtractedArticle {
  title: string;
  text: string;
  excerpt: string;
  byline: string | null;
  length: number;
}

/** Mozilla Readability + jsdom. No network. Trafilatura/news-please equivalent in Node. */
export function extractArticle(html: string, url = "https://example.com/article"): ExtractedArticle {
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const parsed = reader.parse();

  if (!parsed) {
    const fallback = stripTags(html).replace(/\s+/g, " ").trim();
    return {
      title: "",
      text: fallback,
      excerpt: fallback.slice(0, 180),
      byline: null,
      length: fallback.length,
    };
  }

  const text = (parsed.textContent ?? "").replace(/\s+/g, " ").trim();
  return {
    title: parsed.title ?? "",
    text,
    excerpt: (parsed.excerpt ?? text).slice(0, 280),
    byline: parsed.byline ?? null,
    length: parsed.length ?? text.length,
  };
}

function stripTags(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
}
