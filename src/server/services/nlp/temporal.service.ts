// @ts-ignore - chrono-node types are not available, using any
import * as chrono from 'chrono-node';
import { TemporalSignal } from '../../../types';

/**
 * Extract and normalize temporal expressions (dates, times, durations).
 * Uses chrono-node for robust temporal parsing with fallback to regex patterns.
 */
export function extractTemporalSignals(text: string): TemporalSignal[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  try {
    // Parse with chrono-node (returns parsed results with start/end dates)
    const parsedResults = chrono.parse(text);

    const signals: TemporalSignal[] = [];

    for (const result of parsedResults) {
      // Skip if no start date
      if (!result.start) continue;

      let type: TemporalSignal['type'] = 'DATE';
      let normalized: string = '';

      // Determine type based on what chrono found
      const startCertain = !isNaN(result.start.date().getTime());
      const endCertain = result.end ? !isNaN(result.end.date().getTime()) : false;
      const startHourCertain = result.start.isCertain('hour');
      const startMinuteCertain = result.start.isCertain('minute');
      const endHourCertain = result.end ? result.end.isCertain('hour') : false;
      const endMinuteCertain = result.end ? result.end.isCertain('minute') : false;
      if (startCertain && !endCertain) {
        // Single point in time
        if (startHourCertain || startMinuteCertain) {
          type = 'TIME';
          normalized = result.start.date().toISOString();
        } else {
          type = 'DATE';
          normalized = result.start.date().toISOString().split('T')[0];
        }
      } else if (startCertain && endCertain) {
        // Time range or period
        if (startHourCertain || startMinuteCertain || endHourCertain || endMinuteCertain) {
          type = 'PERIOD'; // Time period with start and end times
          const startStr = result.start.date().toISOString();
          const endStr = result.end.date().toISOString();
          normalized = `${startStr}/${endStr}`;
        } else {
          type = 'SET'; // Date range (like "Jan 1-5")
          const startStr = result.start.date().toISOString().split('T')[0];
          const endStr = result.end.date().toISOString().split('T')[0];
          normalized = `${startStr}/${endStr}`;
        }
      } else {
        // Duration or uncertain
        if (result.text.match(/\b\d+\s*(second|minute|hour|day|week|month|year)s?\b/i)) {
          type = 'DURATION';
          // For simplicity, we'll store the original text as normalized for durations
          // In a production system, you might convert to standard duration format (ISO 8601)
          normalized = result.text;
        } else {
          type = 'DATE'; // Fallback
          normalized = startCertain ? result.start.date().toISOString() : result.text;
        }
      }

      if (normalized) {
        // Extract the matched text - try to get the exact match from chrono-node
        let matchedText = text.substring(result.index, result.index + result.text.length);

        // For TIME type, clean up common prepositions that might be included
        if (type === 'TIME') {
          // Remove common leading prepositions like "at", "in", "on" if they seem to be part of the match
          const trimmed = matchedText.trim();
          if (trimmed.startsWith('at ') || trimmed.startsWith('in ') || trimmed.startsWith('on ')) {
            // Check if removing the preposition still leaves a valid time pattern
            const withoutPreposition = trimmed.substring(3);
            if (withoutPreposition.match(/^\d{1,2}:\d{2}(:\d{2})?\s*(am|pm)?$/i)) {
              matchedText = withoutPreposition;
            }
          }
        }

        signals.push({
          text: matchedText,
          normalized,
          type,
          confidence: 0.9, // chrono-node is generally reliable
          snippet: extractSnippet(text, result.index, result.text.length)
        });
      }
}

    // If chrono didn't find anything, fall back to regex patterns for common formats
    if (signals.length === 0) {
      const fallbackSignals = extractTemporalSignalsFallback(text);
      signals.push(...fallbackSignals);
    }

    return signals;
  } catch (error) {
    console.warn('Temporal extraction with chrono failed, falling back to regex:', error);
    return extractTemporalSignalsFallback(text);
  }
}

/**
 * Fallback temporal extraction using regex patterns.
 * Used when chrono-node fails or doesn't find temporal expressions.
 */
function extractTemporalSignalsFallback(text: string): TemporalSignal[] {
  const signals: TemporalSignal[] = [];

  // Common date patterns
  const datePatterns = [
    { pattern: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/, type: 'DATE' as const },
    { pattern: /\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/, type: 'DATE' as const },
    { pattern: /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2},? \d{4}\b/i, type: 'DATE' as const },
    { pattern: /\b\d{1,2} (?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{4}\b/i, type: 'DATE' as const }
  ];

  // Time patterns
  const timePatterns = [
    { pattern: /\b\d{1,2}:\d{2}(:\d{2})?\s*(am|pm)?\b/i, type: 'TIME' as const }
  ];

  // Duration patterns
  const durationPatterns = [
    { pattern: /\b\d+\s*(second|minute|hour|day|week|month|year)s?\b/i, type: 'DURATION' as const }
  ];

  // Relative date patterns (these need article pubDate for normalization)
  const relativePatterns = [
    { pattern: /\b(yesterday|today|tomorrow)\b/i, type: 'DATE' as const },
    { pattern: /\b(last|next)\s+(week|month|year)\b/i, type: 'DATE' as const },
    { pattern: /\b(this)\s+(week|month|year)\b/i, type: 'DATE' as const }
  ];

  const allPatterns = [
    ...datePatterns.map(p => ({ ...p, offset: 0 })), // No capture groups
    ...timePatterns.map(p => ({ ...p, offset: 0 })),
    ...durationPatterns.map(p => ({ ...p, offset: 0 })),
    ...relativePatterns.map(p => ({ ...p, offset: 0 }))
  ];

  for (const { pattern, type } of allPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const matchedText = match[0];

      // For simplicity in fallback, we'll use the matched text as normalized
      // In reality, you'd want to parse and normalize these properly
      let normalized = matchedText.toLowerCase();

      // Try to normalize some common formats
      if (type === 'DATE') {
        // Try to convert to YYYY-MM-DD if possible
        const dateMatch = matchedText.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (dateMatch) {
          const [, month, day, year] = dateMatch;
          const fullYear = year.length === 2 ? `20${year}` : year;
          normalized = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      } else if (type === 'TIME') {
        // Try to normalize to HH:MM:SS
        const timeMatch = matchedText.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i);
        if (timeMatch) {
          let [, hour, minute, second, meridiem] = timeMatch;
          hour = hour.padStart(2, '0');
          second = second || '00';
          if (meridiem) {
            // Convert 12-hour to 24-hour
            let hour24 = parseInt(hour, 10);
            if (meridiem.toLowerCase() === 'pm' && hour24 !== 12) hour24 += 12;
            if (meridiem.toLowerCase() === 'am' && hour24 === 12) hour24 = 0;
            hour = hour24.toString().padStart(2, '0');
          }
          normalized = `${hour}:${minute}:${second}`;
        }
      }

      signals.push({
        text: matchedText,
        normalized,
        type,
        confidence: 0.7, // Lower confidence for fallback
        snippet: extractSnippet(text, match.index, matchedText.length)
      });
    }
  }

  return signals;
}

/**
 * Extract a snippet of text around a match for context.
 */
function extractSnippet(text: string, startIndex: number, length: number): string {
  const beforeStart = Math.max(0, startIndex - 50);
  const afterEnd = Math.min(text.length, startIndex + length + 50);
  const snippet = text.substring(beforeStart, afterEnd);
  return snippet.trim();
}

/**
 * Normalize temporal expressions relative to a reference date (usually article pubDate).
 * This would be called after extraction to convert relative dates to absolute dates.
 */
export function normalizeTemporalSignals(
  signals: TemporalSignal[],
  referenceDate: string // ISO 8601 date string
): TemporalSignal[] {
  if (!signals.length) return signals;

  const refDate = new Date(referenceDate);
  const normalizedSignals: TemporalSignal[] = [];

  for (const signal of signals) {
    let normalizedSignal = { ...signal };

    // Only attempt to normalize relative dates if we have a reference date
    if (signal.text.match(/\b(yesterday|today|tomorrow|last|next|this)\b/i)) {
      try {
        // Parse the temporal expression with the reference date as base
        const parsed = chrono.parseDate(signal.text, refDate);
        if (parsed && !isNaN(parsed.getTime())) {
          normalizedSignal.normalized = parsed.toISOString();
          // If it was a time-only expression, keep just the time part
          if (signal.type === 'TIME') {
            normalizedSignal.normalized = parsed.toISOString().split('T')[1]; // Just time
          } else if (signal.type === 'DATE') {
            normalizedSignal.normalized = parsed.toISOString().split('T')[0]; // Just date
          }
        }
      } catch (error) {
        // If normalization fails, keep original
        console.warn(`Failed to normalize temporal expression "${signal.text}":`, error);
      }
    }

    normalizedSignals.push(normalizedSignal);
  }

  return normalizedSignals;
}