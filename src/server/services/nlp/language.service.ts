import { franc } from 'franc-min';
import { LanguageCode } from '../../../types';

const LANGUAGE_MAP: Record<string, LanguageCode> = {
  'eng': 'en',
  'hin': 'hi',
  'ben': 'bn',
  'tam': 'ta',
  'tel': 'te',
  'mar': 'mr',
  'kan': 'kn',
  'mal': 'ml'
};

/**
 * Detect the language of input text to route to appropriate NLP models.
 *
 * @param text - Raw article text or headline
 * @returns Language detection result with language code and confidence
 */
export function detectLanguage(text: string): {
  language: LanguageCode;
  confidence: number;
  isReliable: boolean;
} {
  if (!text || text.trim().length < 3) {
    return {
      language: 'en',
      confidence: 0.0,
      isReliable: false
    };
  }

  try {
    // franc returns ISO 639-3 codes like 'eng', 'hin', etc.
    // Prefer body text (callers should pass extracted bodies, not RSS blurbs).
    const isoCode = franc(text, { minLength: 3 });

    // Map to our LanguageCode; und/unknown falls back to English without fake confidence.
    const languageCode = (isoCode && isoCode !== 'und' && LANGUAGE_MAP[isoCode])
      ? LANGUAGE_MAP[isoCode]
      : (isoCode === 'und' ? 'en' : (LANGUAGE_MAP[isoCode] || 'en'));

    // No invented confidence theater: reliable only when franc resolved a mapped code
    // on a body long enough to be meaningful.
    const mapped = Boolean(isoCode && isoCode !== 'und' && LANGUAGE_MAP[isoCode]);
    const isReliable = mapped && text.trim().length >= 80;
    const confidence = mapped ? 1 : 0;

    return {
      language: languageCode,
      confidence,
      isReliable
    };
  } catch (error) {
    // Fallback to English on any error
    return {
      language: 'en',
      confidence: 0.0,
      isReliable: false
    };
  }
}

/**
 * Check if detected language is supported for enhanced NLP processing
 */
export function isSupportedLanguage(language: LanguageCode): boolean {
  return ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'kn', 'ml'].includes(language);
}

const ENGLISH_STOPWORDS = new Set([
  "the","a","an","and","or","of","to","in","on","for","with","at","by","from","as","is","are","was","were","be","been",
  "after","over","under","into","about","says","said","amid","as","new","india","indian","govt","government",
  "breaking","watch","live","update","exclusive"
]);

const HINDI_STOPWORDS = new Set([
  "में", "की", "के", "का", "को", "से", "पर", "है", "हैं", "था", "थी", "थे", "और", "या", "यह",
  "वह", "एक", "ने", "हो", "होता", "होती", "लिए", "भी", "नहीं", "तो", "जो", "कि", "इस", "उस",
  "कर", "किया", "किए", "करने", "रहा", "रही", "रहे", "गया", "गई", "गए", "बाद", "पहले", "अब",
  "जब", "तक", "साथ", "द्वारा", "अपने", "अपनी", "अपना", "कुछ", "सब", "बहुत", "भारत", "सरकार"
]);

const BENGALI_STOPWORDS = new Set([
  "এবং", "এর", "একটি", "ও", "থেকে", "করে", "হয়", "এই", "সেই", "আর", "কিন্তু", "যদি", "না", "হবে", "ছিল", "আছে", "করতে"
]);

/**
 * Get appropriate stopwords for language
 */

/** True when a meaningful fraction of letters are Devanagari (U+0900-U+097F). */
export function isDevanagariHeavy(text: string, threshold = 0.25): boolean {
  const letters = String(text || "").match(/\p{L}/gu) || [];
  if (letters.length < 2) return false;
  let dev = 0;
  for (const ch of letters) {
    const cp = ch.codePointAt(0)!;
    if (cp >= 0x0900 && cp <= 0x097F) dev++;
  }
  return (dev / letters.length) >= threshold;
}

/** True when most letters are Latin (Basic Latin + Latin Extended). */
export function isMostlyLatinScript(text: string, threshold = 0.7): boolean {
  const letters = String(text || "").match(/\p{L}/gu) || [];
  if (letters.length < 2) return false;
  let latin = 0;
  for (const ch of letters) {
    const cp = ch.codePointAt(0)!;
    if ((cp >= 0x0041 && cp <= 0x007A) || (cp >= 0x00C0 && cp <= 0x024F)) latin++;
  }
  return (latin / letters.length) >= threshold;
}

export function getStopwordsForLanguage(language: LanguageCode): Set<string> {
  if (language === 'hi') {
    return HINDI_STOPWORDS;
  }
  if (language === 'bn') {
    return BENGALI_STOPWORDS;
  }
  return ENGLISH_STOPWORDS;
}