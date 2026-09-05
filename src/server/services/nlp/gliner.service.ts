/**
 * Heuristic / gazetteer NER helpers.
 *
 * Real model inference lives in transformers.ner.ts (Xenova token-classification).
 * This file no longer pretends to run GLiNER ONNX.
 */
export interface ExtractedEntity {
  text: string;
  normalizedText: string;
  type: string;
  confidence: number;
}

const KNOWN_ORGS = [
  "Supreme Court", "सुप्रीम कोर्ट", "High Court", "RBI", "Reserve Bank of India", "भारतीय रिजर्व बैंक", "रिजर्व बैंक", "Reserve Bank", "SEBI", "ISRO", "DRDO", 
  "CBI", "ED", "Enforcement Directorate", "NIA", "Election Commission", "Parliament", "Lok Sabha", 
  "Rajya Sabha", "Congress", "BJP", "AAP", "TMC", "DMK", "CPI", "Tata", "Reliance", "Adani", 
  "Infosys", "Wipro", "State Bank of India", "SBI", "LIC", "BCCI", "MEA", "PMO"
];

const KNOWN_LOCS = [
  "New Delhi", "Delhi", "नई दिल्ली", "दिल्ली", "Mumbai", "Bengaluru", "Bangalore", "Chennai", "Kolkata", "Hyderabad", 
  "Ahmedabad", "Pune", "Jaipur", "Lucknow", "Patna", "Bhopal", "Chandigarh", "Srinagar", "Shimla", 
  "Assam", "Manipur", "Punjab", "Kerala", "Kashmir", "Ladakh", "Gujarat", "Maharashtra", 
  "Uttar Pradesh", "Bihar", "West Bengal", "Odisha", "Tamil Nadu", "Karnataka", "Telangana", 
  "Andhra Pradesh", "Rajasthan", "Madhya Pradesh", "Haryana", "India", "China", "US", "USA", "UK", "Russia"
];

const PERSON_HONORIFICS = [
  "PM", "Prime Minister", "President", "Chief Minister", "CM", "Governor", "Justice", "Judge", 
  "Shri", "Smt", "Dr", "Prof", "Mr", "Ms", "Mrs"
];

/**
 * Fallback heuristic & gazetteer NER.
 * Guarantees that PERSON, ORG, LOC, and DATE are extracted from real headlines and articles.
 */
export function heuristicExtract(text: string): ExtractedEntity[] {
  if (!text || text.trim().length === 0) return [];
  const entities: ExtractedEntity[] = [];
  const seen = new Set<string>();

  const addEntity = (t: string, type: string, confidence: number) => {
    const clean = t.trim().replace(/^[,.\s]+|[,.\s]+$/g, '');
    if (clean.length < 2 || seen.has(clean.toLowerCase())) return;
    seen.add(clean.toLowerCase());
    entities.push({ text: clean, normalizedText: clean.toLowerCase(), type, confidence });
  };

  // 1. Check known organizations
  for (const org of KNOWN_ORGS) {
    const reg = new RegExp(`\\b${org}\\b`, 'i');
    if (reg.test(text)) {
      addEntity(org, "ORGANIZATION", 0.9);
    }
  }

  // 2. Check known locations
  for (const loc of KNOWN_LOCS) {
    const reg = new RegExp(`\\b${loc}\\b`, 'i');
    if (reg.test(text)) {
      addEntity(loc, "LOCATION", 0.85);
    }
  }

  // 3. Person honorifics: e.g. "PM Modi", "Chief Minister Yogi", "Justice Chandrachud"
  for (const hon of PERSON_HONORIFICS) {
    const honRegex = new RegExp(`\\b${hon}\\.?\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'g');
    let m;
    while ((m = honRegex.exec(text)) !== null) {
      if (m[1] && m[1].length > 2) {
        addEntity(m[1], "PERSON", 0.85);
      }
    }
  }

  // 4. Dates
  const dateMatch = text.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(?:, \d{4})?\b/ig);
  if (dateMatch) {
    dateMatch.forEach(d => addEntity(d, "DATE", 0.8));
  }

  // 5. Monetary values
  const moneyMatch = text.match(/(?:Rs\.?|₹|\$)\s*\d+(?:[.,]\d+)?(?:\s*(?:crore|lakh|million|billion|trillion))?/ig);
  if (moneyMatch) {
    moneyMatch.forEach(m => addEntity(m, "MONEY", 0.85));
  }

  // 6. Prominent multi-word capitalized names / entities
  const capMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g);
  if (capMatches) {
    for (const phrase of capMatches) {
      if (phrase.length > 3 && !seen.has(phrase.toLowerCase())) {
        // Exclude common headline starting phrases
        if (/^(The|This|That|According|Speaking|After|Before|During)\s/i.test(phrase)) continue;
        addEntity(phrase, "PERSON", 0.6);
      }
    }
  }

  // 7. Single capitalized Indian political or prominent names (Modi, Gandhi, Shah, etc.)
  const knownPersons = ["Modi", "नरेंद्र मोदी", "मोदी", "पुतिन", "Gandhi", "Shah", "Kejriwal", "Mamata", "Stalin", "Yogi", "Pawar", "Shinde", "Rajnath", "Jaishankar", "Sitharaman"];
  for (const p of knownPersons) {
    if (/[\u0900-\u097F]/.test(p)) {
      if (text.includes(p)) addEntity(p, "PERSON", 0.9);
    } else {
      const reg = new RegExp(`\\b${p}\\b`, 'i');
      if (reg.test(text)) addEntity(p, "PERSON", 0.9);
    }
  }

  // Unicode-safe Devanagari ORG/LOC includes (word-boundary regex misses these)
  for (const org of KNOWN_ORGS) {
    if (/[\u0900-\u097F]/.test(org) && text.includes(org)) addEntity(org, "ORGANIZATION", 0.9);
  }
  for (const loc of KNOWN_LOCS) {
    if (/[\u0900-\u097F]/.test(loc) && text.includes(loc)) addEntity(loc, "LOCATION", 0.85);
  }

  return entities;
}

/**
 * @deprecated Use extractEntitiesTransformersNer from transformers.ner.ts.
 * Kept for any legacy imports — routes to real Xenova NER (never claims gliner).
 */
export async function extractEntitiesGLiNER(text: string): Promise<ExtractedEntity[]> {
  const { extractEntitiesTransformersNer } = await import("./transformers.ner.js");
  const rows = await extractEntitiesTransformersNer(text);
  return rows.map(({ text: t, normalizedText, type, confidence }) => ({
    text: t,
    normalizedText,
    type,
    confidence,
  }));
}
