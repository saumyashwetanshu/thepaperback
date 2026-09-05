import { tokenize } from "../clustering.service";
import { inferStoryRegion, isNeOrTribalGeo, isRegionalDesk } from "../clustering.service";
import { detectLanguage, getStopwordsForLanguage } from "./language.service";
import { ExtractedEntities } from "../../../types";

import { extractEntitiesTransformersNer } from "./transformers.ner.js";

/**
 * Detailed entity representation with type, confidence, and normalization.
 */
export interface NlpEntity {
  text: string;           // Original entity text as found in the article
  normalized: string;     // Normalized form (e.g., lowercase, removed punctuation)
  type: string;           // 'PERSON', 'ORGANISATION', 'LOCATION', 'EVENT', 'DATE', etc.
  confidence: number;     // Confidence score (0.0 to 1.0)
  source: string;         // Honest detector id: 'transformers-ner' | 'heuristic' | 'gazetteer'. Never claim gliner.
  articleId?: string;     // Optional: ID of the source article
  offsets?: {             // Optional: character offsets in the original text
    start: number;
    end: number;
  };
}

/**
 * Extract detailed entities with typing and confidence.
 * This function returns a list of entities with rich metadata for NLP processing.
 */
export async function extractEntitiesDetailed(text: string): Promise<NlpEntity[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  try {
    // Real Xenova token-classification NER (transformers-ner); heuristic only as fallback.
    const extracted = await extractEntitiesTransformersNer(text);
    const entities: NlpEntity[] = [];
    for (const res of extracted) {
      entities.push({
        text: res.text,
        normalized: normalizeEntity(res.text),
        type: res.type,
        confidence: res.confidence,
        source: res.source === 'transformers-ner' ? 'transformers-ner' : 'heuristic'
      });
    }

    // Add temporal expressions as entities with type DATE
    const langResult = detectLanguage(text);
    const dateEntities = extractTemporalEntities(text, langResult.language);
    
    for (const d of dateEntities) {
      if (!entities.some(e => e.type === 'DATE' && e.normalized === d.normalized)) {
        entities.push(d);
      }
    }

    // Sort by confidence descending and limit to prevent excessive growth
    return entities
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 100);
  } catch (error) {
    console.warn('Detailed entity extraction failed:', error);
    return [];
  }
}

/**
 * Normalize an entity text (lowercase, remove extra punctuation, etc.)
 */
function normalizeEntity(text: string): string {
  return text
    .toLowerCase()
    .replace(/[,.]/g, '') // Remove commas and periods
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Classify an entity candidate into a type using heuristics and gazetteers.
 * Returns the type, confidence, and source.
 */
function classifyEntity(text: string, context: string, language: string): {
  type: 'PERSON' | 'ORGANISATION' | 'LOCATION' | 'EVENT' | 'DATE';
  confidence: number;
  source: 'heuristic' | 'gazetteer';
} {
  const lowerText = text.toLowerCase();
  const lowerContext = context.toLowerCase();

  // 1. Check for dates (high confidence, heuristic)
  const dateResult = checkForDate(text, context);
  if (dateResult && dateResult.type === 'DATE') {
    return dateResult;
  }

  // 2. Check gazetteers for known entities (medium confidence)
  const gazetteerResult = checkGazetteers(text, context, language);
  if (gazetteerResult.confidence > 0.7) {
    return gazetteerResult;
  }

  // 3. Heuristic classification (lower confidence)
  return heuristicClassification(text, context, language);
}

/**
 * Check if the text is a date expression.
 */
function checkForDate(text: string, context: string): {
  type: 'DATE';
  confidence: number;
  source: 'heuristic';
} | null {
  const datePatterns = [
    { pattern: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/, confidence: 0.9 },
    { pattern: /\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/, confidence: 0.9 },
    { pattern: /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2},? \d{4}\b/i, confidence: 0.85 },
    { pattern: /\b\d{1,2} (?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{4}\b/i, confidence: 0.85 },
    { pattern: /\b(?:yesterday|today|tomorrow)\b/i, confidence: 0.95 },
    { pattern: /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, confidence: 0.9 },
    { pattern: /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b/i, confidence: 0.85 }
  ];

  for (const { pattern, confidence } of datePatterns) {
    if (pattern.test(text)) {
      return { type: 'DATE', confidence, source: 'heuristic' };
    }
  }

  // Not a date
  return null;
}

/**
 * Check gazetteers for known entities (simplified).
 * In a real implementation, you would load proper gazetteer files.
 */
function checkGazetteers(text: string, context: string, language: string): {
  type: 'PERSON' | 'ORGANISATION' | 'LOCATION' | 'EVENT' | 'DATE';
  confidence: number;
  source: 'gazetteer';
} {
  const lowerText = text.toLowerCase();
  const lowerContext = context.toLowerCase();

  // Simple gazetteers for demonstration (would be loaded from files in production)
  const personGazetteer = [
    'modi', 'gandhi', 'nehru', 'patel', 'shah', 'kaur', 'singh', 'kumar',
    'amitabh', 'shahruk', 'salman', 'aamir', 'deepika', 'priyanka', 'alia',
    'kejarwal', 'mamata', 'stalin', 'modi', 'yogi', 'adhiyanath'
  ];

  const organisationGazetteer = [
    'tata', 'reliance', 'infosys', 'wipro', 'hcl', 'tech mahindra', 'ltd',
    'limited', 'corp', 'corporation', 'inc', 'incorporated', 'llc', 'plc',
    'bank', 'university', 'college', 'institute', 'foundation', 'association',
    'committee', 'council', 'board', 'authority', 'corporation', 'party',
    'bjp', 'congress', 'aap', 'communist', 'socialist', 'times', 'herald',
    'express', 'news', 'today', 'post', 'guardian', 'journal'
  ];

  const locationGazetteer = [
    'india', 'bharat', 'delhi', 'mumbai', 'kolkata', 'chennai', 'bangalore',
    'hyderabad', 'ahmedabad', 'pune', 'jaipur', 'lucknow', 'kanpur', 'nagpur',
    'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri-chinchwad', 'patna',
    'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut',
    'rajkot', 'kalyan-dombivali', 'vasai-virar', 'varanasi', 'srinagar',
    'aurangabad', 'noida', 'solapur', 'kolhapur', 'junagadh', 'ambatturai',
    'assam', 'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jammu and kashmir',
    'jharkhand', 'karnataka', 'kerala', 'madhya pradesh', 'maharashtra',
    'manipur', 'meghalaya', 'mizoram', 'nagaland', 'odisha', 'punjab',
    'rajasthan', 'sikkim', 'tamil nadu', 'telangana', 'tripura', 'uttar pradesh',
    'uttarakhand', 'west bengal', 'river', 'lake', 'mountain', 'hill', 'valley',
    'beach', 'coast', 'island', 'peninsula', 'gulf', 'bay', 'strait'
  ];

  // Check person gazetteer
  if (personGazetteer.some(name => lowerText.includes(name) ||
                                 (context.includes(name) && /\s+(said|stated|according to|announced|declared|reported)\s+/i.test(context)))) {
    return { type: 'PERSON', confidence: 0.8, source: 'gazetteer' };
  }

  // Check organisation gazetteer
  if (organisationGazetteer.some(org => lowerText.includes(org) ||
                                      /\b(launched|founded|established|opened|closed|acquired|merged|partnered with)\s+/i.test(lowerContext))) {
    return { type: 'ORGANISATION', confidence: 0.75, source: 'gazetteer' };
  }

  // Check location gazetteer
  if (locationGazetteer.some(loc => lowerText.includes(loc) ||
                                  /\b(visited|travelled to|headed to|based in|located in)\s+/i.test(lowerContext))) {
    return { type: 'LOCATION', confidence: 0.7, source: 'gazetteer' };
  }

  // No gazetteer match
  return { type: 'ORGANISATION', confidence: 0, source: 'gazetteer' }; // Default low confidence
}

/**
 * Heuristic classification based on context clues.
 */
function heuristicClassification(text: string, context: string, language: string): {
  type: 'PERSON' | 'ORGANISATION' | 'LOCATION' | 'EVENT' | 'DATE';
  confidence: number;
  source: 'heuristic';
} {
  const lowerText = text.toLowerCase();
  const lowerContext = context.toLowerCase();

  // Person heuristics
  if (/(said|stated|according to|announced|declared|reported)\s+(?:by\s+)?/i.test(lowerContext)) {
    return { type: 'PERSON', confidence: 0.6, source: 'heuristic' };
  }
  if (/\b(shri|shrimati|kumari|dr\.|prof\.|mr\.|mrs\.|ms\.)\s+/i.test(lowerContext)) {
    return { type: 'PERSON', confidence: 0.7, source: 'heuristic' };
  }
  if (/\b(pm|prime minister|cm|chief minister|governor|minister)\b/i.test(lowerContext)) {
    return { type: 'PERSON', confidence: 0.8, source: 'heuristic' };
  }

  // Organisation heuristics
  if (/(launched|founded|established|opened|closed|acquired|merged|partnered with)\s+/i.test(lowerContext)) {
    return { type: 'ORGANISATION', confidence: 0.6, source: 'heuristic' };
  }
  if (/\b(zero loss|profit|revenue|earnings|share|stock|market)\b/i.test(lowerContext)) {
    return { type: 'ORGANISATION', confidence: 0.5, source: 'heuristic' };
  }

  // Location heuristics
  if (/(visited|travelled to|headed to|based in|located in|from|to)\s+/i.test(lowerContext)) {
    return { type: 'LOCATION', confidence: 0.5, source: 'heuristic' };
  }
  if (/\b(election|vote|poll|referendum|coup|rebellion|revolution|war|conflict|battle|invasion|summit|meeting|conference|convention)\b/i.test(lowerContext)) {
    return { type: 'EVENT', confidence: 0.6, source: 'heuristic' };
  }

  // Event heuristics
  if (/\b(accident|incident|explosion|blast|flood|earthquake|cyclone|storm|rain|protest|strike|riot|attack|fire|crash|collision|derailment|death|kill|murder|suicide)\b/i.test(lowerContext)) {
    return { type: 'EVENT', confidence: 0.7, source: 'heuristic' };
  }
  if (/\b(budget|policy|act|bill|law|ordinance|regulation|directive|order|notification|circular)\b/i.test(lowerContext)) {
    return { type: 'EVENT', confidence: 0.6, source: 'heuristic' };
  }

  // Default to organisation for unknown (since most capitalized words in news are organisations or people)
  return { type: 'ORGANISATION', confidence: 0.3, source: 'heuristic' };
}

/**
 * Extract temporal expressions as entities with type DATE.
 * This is a simplified version - in production you might use chrono-node.
 */
function extractTemporalEntities(text: string, language: string): NlpEntity[] {
  const entities: NlpEntity[] = [];
  const datePatterns = [
    { pattern: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g, format: 'exact' },
    { pattern: /\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/g, format: 'exact' },
    { pattern: /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2},? \d{4}\b/ig, format: 'exact' },
    { pattern: /\b\d{1,2} (?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{4}\b/ig, format: 'exact' },
    { pattern: /\b(?:yesterday|today|tomorrow)\b/ig, format: 'relative' },
    { pattern: /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/ig, format: 'weekday' },
    { pattern: /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b/ig, format: 'month' }
  ];

  for (const { pattern, format } of datePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const matchedText = match[0];
      const normalized = normalizeDate(matchedText, format, text); // Simplified normalization

      entities.push({
        text: matchedText,
        normalized,
        type: 'DATE',
        confidence: 0.8, // Heuristic confidence for temporal expressions
        source: 'heuristic',
        // Offsets could be calculated from match.index
        offsets: {
          start: match.index,
          end: pattern.lastIndex
        }
      });
    }
  }

  return entities;
}

/**
 * Normalize a date expression to a standard format.
 * This is a simplified placeholder.
 */
function normalizeDate(text: string, format: string, context: string): string {
  // In a real implementation, you would parse the date and return a standard format (ISO 8601)
  // For now, we just return the lowercase text as a placeholder
  return text.toLowerCase();
}

/**
 * Convert detailed entities to the ExtractedEntities format (five arrays).
 * Used for backward compatibility with existing caching layer.
 */
function extractEntitiesFromDetailed(detailed: NlpEntity[]): ExtractedEntities {
  const people: string[] = [];
  const organisations: string[] = [];
  const places: string[] = [];
  const events: string[] = [];
  const explicitDates: string[] = [];

  for (const entity of detailed) {
    switch (entity.type) {
      case 'PERSON':
        people.push(entity.text);
        break;
      case 'ORGANISATION':
        organisations.push(entity.text);
        break;
      case 'LOCATION':
        places.push(entity.text);
        break;
      case 'EVENT':
        events.push(entity.text);
        break;
      case 'DATE':
        explicitDates.push(entity.text);
        break;
    }
  }

  // Remove duplicates within each array (preserve order)
  return {
    people: [...new Set(people)],
    organisations: [...new Set(organisations)],
    places: [...new Set(places)],
    events: [...new Set(events)],
    explicitDates: [...new Set(explicitDates)]
  };
}

/**
 * Convert detailed entities to a flattened string array.
 * Used for the existing caching layer that expects a string[].
 */
export function extractEntitiesFlattened(detailed: NlpEntity[]): string[] {
  return [...new Set(detailed.map(entity => entity.text))];
}