import dbPromise from './db.js';
import { NewsStory, LiveWireItem, Perspective, TimelineEvent } from '../types.js';
import { isJunkTitle, isHomepageEligible, normalizeTitle } from '../server/services/clustering.service.js';

export async function saveNewsData(stories: NewsStory[], wire: LiveWireItem[]) {
  const db = await dbPromise;

  await db.exec('BEGIN TRANSACTION');
  try {
    // Insert Live Wire
    for (const item of wire) {
      await db.run(`
        INSERT OR IGNORE INTO live_wire 
        (id, title, source, bias, url, timestamp, category, region, status, relatedStoryId, summary, language, canonicalUrl, extractionStatus, sourceDomain)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.id, item.title, item.source, item.bias, item.url, item.timestamp,
        item.category, item.region, item.status, item.relatedStoryId, item.summary,
        (item as any).language || 'en', (item as any).canonicalUrl || item.url, (item as any).extractionStatus || 'PENDING', (item as any).sourceDomain || ''
      ]);
    }

    // Insert Stories
    for (const story of stories) {
      const status = (story as any).status || 'ACTIVE';
      const updatedAt = (story as any).updatedAt || new Date().toISOString();
      await db.run(`
        INSERT OR REPLACE INTO stories 
        (id, title, description, date, timestamp, category, institution, region, regionType, language, 
         imageUrl, sourceUrl, verifiableConsensus, contestedContext, narrativeLandscape, whyItMatters, 
         outstandingUncertainty, readerTakeaway, blindspot, evidenceStatus, isSingleSource, isWireDerived, 
         sourceCount, independentReportingCount, wireRepublishCount, sharedFactualGround, factualityScore, 
         sourceIntegrity, mediaLiteracyInsight, narrativeDivergence, metaSummary, entities, biasSpectrum, 
         narrativeDetails, framingHighlights, primaryEvidence, pointsOfDisagreement, wireGroupings, consensusClaims, narrativeDenoiser, dataAudit, status, updatedAt, importanceScore, breadthScore, velocityScore, impactScore, divergenceScore, regionalGapScore, pageOneRank, evidenceTrail, divergenceMap, primaryReportingOutlet)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        story.id, story.title, story.description, story.date, story.timestamp, story.category, story.institution, 
        story.region, story.regionType, story.language, story.imageUrl, story.sourceUrl, story.verifiableConsensus, 
        story.contestedContext, story.narrativeLandscape, story.whyItMatters, story.outstandingUncertainty, 
        story.readerTakeaway, story.blindspot, story.evidenceStatus, story.isSingleSource ? 1 : 0, story.isWireDerived ? 1 : 0, 
        story.sourceCount, story.independentReportingCount, story.wireRepublishCount, story.sharedFactualGround, story.factualityScore, 
        story.sourceIntegrity, story.mediaLiteracyInsight, story.narrativeDivergence, story.metaSummary, 
        JSON.stringify(story.entities || {}), JSON.stringify(story.biasSpectrum || {}), JSON.stringify(story.narrativeDetails || {}), 
        JSON.stringify(story.framingHighlights || {}), JSON.stringify(story.primaryEvidence || []), JSON.stringify(story.pointsOfDisagreement || []), 
        JSON.stringify(story.wireGroupings || []), JSON.stringify(story.consensusClaims || []), JSON.stringify(story.narrativeDenoiser || {}),
        JSON.stringify(story.dataAudit || []), status, updatedAt, story.importanceScore || 0, story.breadthScore || 0, story.velocityScore || 0, story.impactScore || 0, story.divergenceScore || 0, story.regionalGapScore || 0, story.pageOneRank || 0, story.evidenceTrail || '', story.divergenceMap || '', story.primaryReportingOutlet || ''
      ]);

      // Insert Perspectives
      if (story.perspectives) {
        for (const p of story.perspectives) {
          const pid = p.url || Math.random().toString(36).substring(7); // Use URL as ID or random
          await db.run(`
            INSERT OR REPLACE INTO perspectives 
            (id, storyId, source, title, bias, inclinationLabel, reliability, url, quote, leadParagraph, 
             standfirst, authorByline, directQuotes, quotesWithAttribution, evidenceDepth, editorialFraming, 
             framingLens, narrativeSummary, framingStrategy, emphasized, downplayed, publishedAt, domain, 
             canonicalDomain, sourceIntegrity, sourceType, evidenceLabel, confidenceScore, imageUrl, 
             republishedOutlets, syndicatedAgency, bodyWordCount, extractionStatus)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            pid, story.id, p.source, p.title, p.bias, p.inclinationLabel, p.reliability, p.url, p.quote, p.leadParagraph,
            p.standfirst, p.authorByline, JSON.stringify(p.directQuotes || []), JSON.stringify(p.quotesWithAttribution || []), 
            p.evidenceDepth, p.editorialFraming, p.framingLens, p.narrativeSummary, p.framingStrategy, p.emphasized, 
            p.downplayed, p.publishedAt, p.domain, p.canonicalDomain, p.sourceIntegrity, p.sourceType, p.evidenceLabel, 
            p.confidenceScore, p.imageUrl, JSON.stringify(p.republishedOutlets || []), p.syndicatedAgency, p.bodyWordCount,
            p.extractionStatus || null
          ]);
        }
      }

      // Insert Timeline
      if (story.timeline) {
        for (const t of story.timeline) {
          const tid = Math.random().toString(36).substring(7);
          await db.run(`
            INSERT OR REPLACE INTO timeline_events 
            (id, storyId, step, time, date, title, description, primarySource, sourceUrl, isWire)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            tid, story.id, t.step, t.time, t.date, t.title, t.description, t.primarySource, t.sourceUrl, t.isWire ? 1 : 0
          ]);
        }
      }
    }
    await db.exec('COMMIT');
  } catch (err) {
    await db.exec('ROLLBACK');
    throw err;
  }
}

async function mapStoriesWithRelations(storiesRows: any[]): Promise<NewsStory[]> {
  if (!storiesRows || storiesRows.length === 0) return [];

  const db = await dbPromise;
  const storyIds = storiesRows.map(r => r.id);
  const placeholders = storyIds.map(() => '?').join(',');

  const perspectivesRows = await db.all(`SELECT * FROM perspectives WHERE storyId IN (${placeholders})`, storyIds);
  const timelineRows = await db.all(`SELECT * FROM timeline_events WHERE storyId IN (${placeholders}) ORDER BY date ASC`, storyIds);

  return storiesRows.map(row => {
    return {
      ...row,
      isSingleSource: !!row.isSingleSource,
      isWireDerived: !!row.isWireDerived,
      entities: JSON.parse(row.entities || '{}'),
      biasSpectrum: JSON.parse(row.biasSpectrum || '{}'),
      narrativeDetails: JSON.parse(row.narrativeDetails || '{}'),
      framingHighlights: JSON.parse(row.framingHighlights || '{}'),
      primaryEvidence: JSON.parse(row.primaryEvidence || '[]'),
      pointsOfDisagreement: JSON.parse(row.pointsOfDisagreement || '[]'),
      wireGroupings: JSON.parse(row.wireGroupings || '[]'),
      consensusClaims: JSON.parse(row.consensusClaims || '[]'),
      narrativeDenoiser: JSON.parse(row.narrativeDenoiser || '{}'),
      dataAudit: JSON.parse(row.dataAudit || '[]'),
      perspectives: perspectivesRows.filter(p => p.storyId === row.id).map(p => ({
        ...p,
        directQuotes: JSON.parse(p.directQuotes || '[]'),
        quotesWithAttribution: JSON.parse(p.quotesWithAttribution || '[]'),
        republishedOutlets: JSON.parse(p.republishedOutlets || '[]'),
        keyOmissions: p.downplayed || p.keyOmissions || ""
      })),
      timeline: timelineRows.filter(t => t.storyId === row.id).map(t => ({
        ...t,
        isWire: !!t.isWire
      }))
    };
  });
}

// ------------------------------------------------------------------
// Specific Optimized Rail Queries
// ------------------------------------------------------------------


const REGIONAL_OUTLETS = [
  'EastMojo', 'The Shillong Times', 'Sentinel Assam', 'Nagaland Post', 
  'OdishaTV', 'The News Minute', 'Northeast Now', 'Imphal Free Press'
];


function filterJunkStories(stories: NewsStory[]): NewsStory[] {
  return (stories || []).filter((s) => !isJunkTitle(s?.title || ""));
}

function filterHomepageEligible(stories: NewsStory[]): NewsStory[] {
  return (stories || []).filter((s) => isHomepageEligible(s));
}

/** Dedupe homepage candidates by cluster id when present, else normalized title. */
function homepageDedupeKey(story: NewsStory): string {
  const anyStory = story as any;
  const clusterKey = String(anyStory.clusterId || anyStory.cluster_id || "").trim();
  if (clusterKey) return `c:${clusterKey}`;
  const titleKey = normalizeTitle(String(story?.title || ""));
  return titleKey ? `t:${titleKey}` : "";
}

function dedupeHomepageStories(stories: NewsStory[], seen?: Set<string>): NewsStory[] {
  const local = seen ?? new Set<string>();
  const out: NewsStory[] = [];
  for (const story of stories || []) {
    const key = homepageDedupeKey(story);
    if (!key || local.has(key)) continue;
    local.add(key);
    out.push(story);
  }
  return out;
}

/** Cross-rail helper: keep first eligible story per normalized title / cluster. */
export function dedupeStoriesByNormalizedTitle(stories: NewsStory[], seen?: Set<string>): NewsStory[] {
  return dedupeHomepageStories(stories, seen);
}

async function mapAndFilterJunk(rows: any[]): Promise<NewsStory[]> {
  const mapped = await mapStoriesWithRelations(rows || []);
  return filterJunkStories(mapped);
}

/** Homepage rails: overfetch then keep English-first eligible stories only. */
async function mapAndFilterHomepage(rows: any[]): Promise<NewsStory[]> {
  const mapped = await mapStoriesWithRelations(rows || []);
  return dedupeHomepageStories(filterHomepageEligible(mapped));
}

export async function getLeadStory(excludeIds: string[] = []): Promise<NewsStory | null> {
  const db = await dbPromise;
  const placeholders = excludeIds.map(() => '?').join(',');
  const regionalList = REGIONAL_OUTLETS.map(o => `'${o}'`).join(',');
  const fetchLimit = 24;

  const nationalQuery = `
    SELECT * FROM stories
    WHERE (status = 'ACTIVE' OR status IS NULL)
    AND primaryReportingOutlet NOT IN (${regionalList})
    AND category != 'States & Regions'
    AND (region = 'National' OR region IS NULL)
    ${excludeIds.length ? `AND id NOT IN (${placeholders})` : ''}
    ORDER BY COALESCE(pageOneRank, importanceScore) DESC, breadthScore DESC
    LIMIT ?
  `;
  let rows = await db.all(nationalQuery, [...excludeIds, fetchLimit]);

  if (!rows.length) {
    const fallbackQuery = `
      SELECT * FROM stories
      WHERE (status = 'ACTIVE' OR status IS NULL)
      AND primaryReportingOutlet NOT IN (${regionalList})
      ${excludeIds.length ? `AND id NOT IN (${placeholders})` : ''}
      ORDER BY COALESCE(pageOneRank, importanceScore) DESC, breadthScore DESC
      LIMIT ?
    `;
    rows = await db.all(fallbackQuery, [...excludeIds, fetchLimit]);
  }

  if (!rows.length) {
    const softQuery = `
      SELECT * FROM stories
      WHERE 1=1
      ${excludeIds.length ? `AND id NOT IN (${placeholders})` : ''}
      ORDER BY timestamp DESC, COALESCE(pageOneRank, importanceScore) DESC
      LIMIT ?
    `;
    rows = await db.all(softQuery, [...excludeIds, fetchLimit]);
  }

  const mapped = await mapAndFilterHomepage(rows);
  return mapped[0] || null;
}

export async function getTrendingStories(limit: number = 4, excludeIds: string[] = []): Promise<NewsStory[]> {
  const db = await dbPromise;
  const placeholders = excludeIds.map(() => '?').join(',');
  const regionalList = REGIONAL_OUTLETS.map(o => `'${o}'`).join(',');
  const fetchLimit = Math.max(limit * 8, limit + 16);
  const query = `
    SELECT * FROM stories
    WHERE (status = 'ACTIVE' OR status IS NULL)
    AND primaryReportingOutlet NOT IN (${regionalList})
    AND category != 'States & Regions'
    ${excludeIds.length ? `AND id NOT IN (${placeholders})` : ''}
    ORDER BY velocityScore DESC
    LIMIT ?
  `;
  let rows = await db.all(query, [...excludeIds, fetchLimit]);
  if (!rows.length) {
    const fallbackQuery = `
      SELECT * FROM stories
      WHERE (status = 'ACTIVE' OR status IS NULL)
      ${excludeIds.length ? `AND id NOT IN (${placeholders})` : ''}
      ORDER BY velocityScore DESC
      LIMIT ?
    `;
    rows = await db.all(fallbackQuery, [...excludeIds, fetchLimit]);
  }
  if (!rows.length) {
    const softQuery = `
      SELECT * FROM stories
      WHERE 1=1
      ${excludeIds.length ? `AND id NOT IN (${placeholders})` : ''}
      ORDER BY timestamp DESC, velocityScore DESC
      LIMIT ?
    `;
    rows = await db.all(softQuery, [...excludeIds, fetchLimit]);
  }
  const mapped = await mapAndFilterHomepage(rows);
  return mapped.slice(0, limit);
}

export async function getEssentialStories(limit: number = 4, excludeIds: string[] = []): Promise<NewsStory[]> {
  const db = await dbPromise;
  const placeholders = excludeIds.map(() => '?').join(',');
  const regionalList = REGIONAL_OUTLETS.map(o => `'${o}'`).join(',');
  const fetchLimit = Math.max(limit * 8, limit + 16);
  const query = `
    SELECT * FROM stories
    WHERE (status = 'ACTIVE' OR status IS NULL)
    AND primaryReportingOutlet NOT IN (${regionalList})
    AND category != 'States & Regions'
    AND (region = 'National' OR region IS NULL)
    ${excludeIds.length ? `AND id NOT IN (${placeholders})` : ''}
    ORDER BY impactScore DESC
    LIMIT ?
  `;
  let rows = await db.all(query, [...excludeIds, fetchLimit]);
  if (!rows.length) {
    const fallbackQuery = `
      SELECT * FROM stories
      WHERE (status = 'ACTIVE' OR status IS NULL)
      AND primaryReportingOutlet NOT IN (${regionalList})
      ${excludeIds.length ? `AND id NOT IN (${placeholders})` : ''}
      ORDER BY impactScore DESC
      LIMIT ?
    `;
    rows = await db.all(fallbackQuery, [...excludeIds, fetchLimit]);
  }
  if (!rows.length) {
    const softQuery = `
      SELECT * FROM stories
      WHERE 1=1
      ${excludeIds.length ? `AND id NOT IN (${placeholders})` : ''}
      ORDER BY timestamp DESC, impactScore DESC
      LIMIT ?
    `;
    rows = await db.all(softQuery, [...excludeIds, fetchLimit]);
  }
  const mapped = await mapAndFilterHomepage(rows);
  return mapped.slice(0, limit);
}

export async function getDivergingStories(limit: number = 2, excludeIds: string[] = []): Promise<NewsStory[]> {
  const db = await dbPromise;
  const placeholders = excludeIds.map(() => '?').join(',');
  const fetchLimit = Math.max(limit * 8, limit + 16);
  const query = `
    SELECT * FROM stories
    WHERE (status = 'ACTIVE' OR status IS NULL)
    ${excludeIds.length ? `AND id NOT IN (${placeholders})` : ''}
    ORDER BY divergenceScore DESC
    LIMIT ?
  `;
  const rows = await db.all(query, [...excludeIds, fetchLimit]);
  const mapped = await mapAndFilterHomepage(rows);
  return mapped.slice(0, limit);
}

export async function getVoicesOfIndiaStories(limit: number = 4, excludeIds: string[] = []): Promise<NewsStory[]> {
  const db = await dbPromise;
  const placeholders = excludeIds.map(() => '?').join(',');
  const regionalList = REGIONAL_OUTLETS.map(o => `'${o}'`).join(',');
  const fetchLimit = Math.max(limit * 8, limit + 16);
  const query = `
    SELECT * FROM stories
    WHERE (status = 'ACTIVE' OR status IS NULL)
    AND (
      primaryReportingOutlet IN (${regionalList})
      OR region != 'National'
      OR category = 'States & Regions'
      OR regionalGapScore > 0
    )
    ${excludeIds.length ? `AND id NOT IN (${placeholders})` : ''}
    ORDER BY COALESCE(regionalGapScore, importanceScore) DESC
    LIMIT ?
  `;
  let rows = await db.all(query, [...excludeIds, fetchLimit]);
  if (!rows.length) {
    const softQuery = `
      SELECT * FROM stories
      WHERE 1=1
      ${excludeIds.length ? `AND id NOT IN (${placeholders})` : ''}
      ORDER BY timestamp DESC, COALESCE(regionalGapScore, importanceScore) DESC
      LIMIT ?
    `;
    rows = await db.all(softQuery, [...excludeIds, fetchLimit]);
  }
  const mapped = await mapAndFilterHomepage(rows);
  return mapped.slice(0, limit);
}

export async function getOtherDevelopments(limit: number = 5, excludeIds: string[] = []): Promise<NewsStory[]> {
  const db = await dbPromise;
  const placeholders = excludeIds.map(() => '?').join(',');
  const fetchLimit = Math.max(limit * 8, limit + 16);
  const query = `
    SELECT * FROM stories
    WHERE (status = 'ACTIVE' OR status IS NULL)
    ${excludeIds.length ? `AND id NOT IN (${placeholders})` : ''}
    ORDER BY importanceScore DESC
    LIMIT ?
  `;
  let rows = await db.all(query, [...excludeIds, fetchLimit]);
  if (!rows.length) {
    const softQuery = `
      SELECT * FROM stories
      WHERE 1=1
      ${excludeIds.length ? `AND id NOT IN (${placeholders})` : ''}
      ORDER BY timestamp DESC, importanceScore DESC
      LIMIT ?
    `;
    rows = await db.all(softQuery, [...excludeIds, fetchLimit]);
  }
  const mapped = await mapAndFilterHomepage(rows);
  return mapped.slice(0, limit);
}

// ------------------------------------------------------------------
// Legacy General Queries
// ------------------------------------------------------------------

export async function getStories(limit: number, offset: number): Promise<NewsStory[]> {
  const db = await dbPromise;
  let storiesRows = await db.all(`SELECT * FROM stories WHERE status = 'ACTIVE' OR status IS NULL ORDER BY timestamp DESC LIMIT ? OFFSET ?`, [limit, offset]);
  if (!storiesRows.length) {
    storiesRows = await db.all(`SELECT * FROM stories ORDER BY timestamp DESC LIMIT ? OFFSET ?`, [limit, offset]);
  }
  return mapStoriesWithRelations(storiesRows);
}

async function searchStories(query: string, limit: number = 20): Promise<NewsStory[]> {
  const db = await dbPromise;
  const searchPattern = `%${query}%`;
  const storiesRows = await db.all(
    `SELECT * FROM stories WHERE (status = 'ACTIVE' OR status IS NULL) AND (title LIKE ? OR description LIKE ? OR category LIKE ?) ORDER BY importanceScore DESC LIMIT ?`,
    [searchPattern, searchPattern, searchPattern, limit]
  );
  return mapStoriesWithRelations(storiesRows);
}

export async function getLiveWire(limit: number = 15): Promise<LiveWireItem[]> {
  const db = await dbPromise;
  const fetchLimit = Math.max(limit * 3, limit + 20);
  const rows = await db.all(`SELECT * FROM live_wire ORDER BY timestamp DESC LIMIT ?`, [fetchLimit]);
  return (rows || []).filter((item: any) => !isJunkTitle(item?.title || "")).slice(0, limit);
}

export async function getStoryById(id: string): Promise<NewsStory | null> {
  const db = await dbPromise;
  const row = await db.get(`SELECT * FROM stories WHERE id = ?`, [id]);
  if (row) {
    const mapped = await mapStoriesWithRelations([row]);
    return mapped[0] || null;
  }

  // Check if this ID is in live_wire
  const wireRow = await db.get(`SELECT * FROM live_wire WHERE id = ?`, [id]);
  if (wireRow) {
    // If it points to an existing story, return that full story
    if (wireRow.relatedStoryId && wireRow.relatedStoryId !== "unknown" && wireRow.relatedStoryId !== id) {
      const related = await getStoryById(wireRow.relatedStoryId);
      if (related) return related;
    }

    const formattedDate = wireRow.timestamp 
      ? new Date(wireRow.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Today";

    const wireStory: NewsStory = {
      id: wireRow.id,
      title: wireRow.title,
      description: wireRow.summary || wireRow.title,
      summary: wireRow.summary || wireRow.title,
      date: formattedDate,
      timestamp: wireRow.timestamp || new Date().toISOString(),
      category: wireRow.category || "National",
      institution: "Live Wire Desk",
      region: wireRow.region || "National",
      sourceUrl: wireRow.url,
      verifiableConsensus: `Live Wire dispatch filed by ${wireRow.source || "National Press Desk"}. Cross-outlet corroboration is actively tracked as further newsrooms report.`,
      contestedContext: "Single-source live reporting. Independent desk corroboration pending.",
      narrativeLandscape: `Real-time filing from ${wireRow.source || "Primary Desk"}. Editorial divergence will update as regional and national desks respond.`,
      narrativeDetails: {
        leftNarrative: "",
        centerNarrative: `Primary report from ${wireRow.source || "Primary Desk"}: ${wireRow.title}`,
        rightNarrative: "",
        mainstreamVsIndependent: `Direct wire filing from ${wireRow.source || "Primary Desk"}.`,
        regionalVsNational: wireRow.region ? `Filed under ${wireRow.region} regional beat.` : "National filing.",
        keyOmissions: "Independent secondary confirmations have not yet been logged in this archive."
      },
      whyItMatters: `Breaking intelligence from ${wireRow.source || "Media Desk"}. Tracking updates in real time.`,
      outstandingUncertainty: "Awaiting corroboration or official follow-up from concurrent reporting desks.",
      readerTakeaway: `This is a live dispatch published by ${wireRow.source || "Media Desk"}. Corroboration metrics will update as more outlets cover the development.`,
      evidenceStatus: "SINGLE-SOURCE",
      isSingleSource: true,
      isWireDerived: true,
      sourceCount: 1,
      independentReportingCount: 1,
      sourceIntegrity: "Standard",
      factualityScore: 80,
      entities: {
        people: [],
        institutions: wireRow.source ? [wireRow.source] : [],
        places: wireRow.region ? [wireRow.region] : [],
        topics: wireRow.category ? [wireRow.category] : []
      },
      perspectives: [
        {
          source: wireRow.source || "Media Desk",
          title: wireRow.title,
          bias: wireRow.bias || "center",
          reliability: "high",
          url: wireRow.url,
          editorialFraming: "Direct Wire Dispatch",
          framingLens: "Breaking Single-Source Dispatch",
          narrativeSummary: wireRow.summary || wireRow.title,
          publishedAt: wireRow.timestamp,
          sourceIntegrity: "Standard",
          confidenceScore: 75,
          extractionStatus: (wireRow.extractionStatus as any) || "EXTRACTED"
        }
      ],
      timeline: [
        {
          step: "1",
          time: wireRow.timestamp ? new Date(wireRow.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
          date: formattedDate,
          title: "Initial Wire Filing",
          description: wireRow.title,
          primarySource: wireRow.source,
          sourceUrl: wireRow.url,
          isWire: true
        }
      ],
      dataAudit: [
        { metric: "Reporting Standard", value: "Single-Source Live Wire", status: "Developing", source: wireRow.source || "Feed" },
        { metric: "Corroboration Status", value: "Pending Cross-Desk Verification", status: "Pending", source: "Algorithmic Ingestion" }
      ]
    };

    return wireStory;
  }

  return null;
}

export async function saveFactCheck(fc: import('../types.js').FactCheckRecord) {
  const db = await dbPromise;
  await db.run(`
    INSERT OR REPLACE INTO fact_checks 
    (id, claim, verdict, verdictDetail, primaryReportingOutlet, corroboratingSources, evidenceTrail, divergence, confidenceScore, timestamp, status, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    fc.id, fc.claim, fc.verdict, fc.verdictDetail, fc.primaryReportingOutlet, JSON.stringify(fc.corroboratingSources || []),
    fc.evidenceTrail, fc.divergence, fc.confidenceScore, fc.timestamp, fc.status, fc.category
  ]);
}

export async function getFactChecks(limit: number = 20): Promise<import('../types.js').FactCheckRecord[]> {
  const db = await dbPromise;
  const rows = await db.all(`SELECT * FROM fact_checks ORDER BY timestamp DESC LIMIT ?`, [limit]);
  return rows.map(row => ({
    ...row,
    corroboratingSources: JSON.parse(row.corroboratingSources || '[]')
  }));
}

export async function getAiCache(id: string): Promise<any> {
  const db = await dbPromise;
  const row = await db.get(`SELECT * FROM ai_cache WHERE id = ?`, [id]);
  if (!row) return null;
  return {
    ...row,
    entities: JSON.parse(row.entities || '[]'),
    embedding: JSON.parse(row.embedding || '[]')
  };
}

export async function setAiCache(id: string, data: any) {
  const db = await dbPromise;
  await db.run(`
    INSERT OR REPLACE INTO ai_cache (id, entities, predicate, geoOrigin, publisherTier, embedding, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    id, JSON.stringify(data.entities || []), data.predicate || '', data.geoOrigin || '', data.publisherTier || '',
    JSON.stringify(data.embedding || []), new Date().toISOString()
  ]);
}

export async function getStorySynthesisCache(hash: string): Promise<any | null> {
  try {
    const db = await dbPromise;
    const row = await db.get(`SELECT payload FROM ai_story_synthesis_cache WHERE hash = ?`, [hash]);
    if (!row || !row.payload) return null;
    return JSON.parse(row.payload);
  } catch {
    return null;
  }
}

export async function setStorySynthesisCache(hash: string, payload: any): Promise<void> {
  try {
    const db = await dbPromise;
    await db.run(
      `INSERT OR REPLACE INTO ai_story_synthesis_cache (hash, payload, timestamp) VALUES (?, ?, ?)`,
      [hash, JSON.stringify(payload), new Date().toISOString()]
    );
  } catch (err) {
    console.warn('[db] Failed to set story synthesis cache:', err);
  }
}

export async function reactivateRecentStories(): Promise<number> {
  const db = await dbPromise;
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const result = await db.run(
    `UPDATE stories SET status = 'ACTIVE' WHERE status = 'ARCHIVED' AND COALESCE(updatedAt, timestamp) > ?`,
    [cutoff]
  );
  const changes = (result as any)?.changes ?? 0;
  if (changes > 0) {
    console.log(`[db] reactivateRecentStories: restored ${changes} stories from ARCHIVED -> ACTIVE (7-day window)`);
  }
  return changes;
}

export async function archiveStaleStories() {
  const db = await dbPromise;
  // Recover recently archived stories before applying the rolling archive window
  await reactivateRecentStories();
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await db.run(`UPDATE stories SET status = 'ARCHIVED' WHERE status = 'ACTIVE' AND (COALESCE(updatedAt, timestamp) < ?)`, [cutoff]);
}

export async function getActiveStoriesForClustering(): Promise<NewsStory[]> {
  const db = await dbPromise;
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const storiesRows = await db.all(`SELECT * FROM stories WHERE status = 'ACTIVE' AND (COALESCE(updatedAt, timestamp) > ?) ORDER BY timestamp DESC`, [cutoff]);
  return mapStoriesWithRelations(storiesRows);
}
