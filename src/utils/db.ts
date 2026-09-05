import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

// Ensure .data directory exists
const dataDir = path.resolve('.data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPromise = open({
  filename: path.join(dataDir, 'thepaperback.db'),
  driver: sqlite3.Database
});

export async function initDb(): Promise<Database> {
  const db = await dbPromise;
  await db.exec('PRAGMA journal_mode = WAL');
  await db.exec('PRAGMA busy_timeout = 5000');
  await db.exec('PRAGMA synchronous = NORMAL');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT,
      affiliation TEXT,
      avatar TEXT,
      createdAt TEXT
    );



    CREATE TABLE IF NOT EXISTS pulse_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT,
      summary TEXT,
      content TEXT NOT NULL,
      authorId TEXT,
      authorName TEXT,
      authorRole TEXT,
      authorAvatar TEXT,
      sourcesCited TEXT,
      readingTimeMinutes INTEGER,
      upvotes INTEGER DEFAULT 1,
      hasUpvoted INTEGER DEFAULT 1,
      publishedAt TEXT,
      tags TEXT
    );

    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT,
      timestamp TEXT,
      category TEXT,
      institution TEXT,
      region TEXT,
      regionType TEXT,
      language TEXT,
      imageUrl TEXT,
      sourceUrl TEXT,
      verifiableConsensus TEXT,
      contestedContext TEXT,
      narrativeLandscape TEXT,
      whyItMatters TEXT,
      outstandingUncertainty TEXT,
      readerTakeaway TEXT,
      blindspot TEXT,
      evidenceStatus TEXT,
      isSingleSource INTEGER,
      isWireDerived INTEGER,
      sourceCount INTEGER,
      independentReportingCount INTEGER,
      wireRepublishCount INTEGER,
      sharedFactualGround TEXT,
      factualityScore INTEGER,
      sourceIntegrity TEXT,
      mediaLiteracyInsight TEXT,
      narrativeDivergence TEXT,
      metaSummary TEXT,
      entities TEXT,
      biasSpectrum TEXT,
      narrativeDetails TEXT,
      framingHighlights TEXT,
      primaryEvidence TEXT,
      pointsOfDisagreement TEXT,
      wireGroupings TEXT,
      consensusClaims TEXT,
      narrativeDenoiser TEXT,
      evidenceTrail TEXT,
      divergenceMap TEXT,
      primaryReportingOutlet TEXT,
      importanceScore INTEGER,
      breadthScore INTEGER,
      velocityScore INTEGER,
      impactScore INTEGER,
      divergenceScore INTEGER,
      regionalGapScore INTEGER,
      pageOneRank INTEGER
    );

    CREATE TABLE IF NOT EXISTS perspectives (
      id TEXT PRIMARY KEY,
      storyId TEXT NOT NULL,
      source TEXT NOT NULL,
      title TEXT,
      bias TEXT,
      inclinationLabel TEXT,
      reliability TEXT,
      url TEXT,
      quote TEXT,
      leadParagraph TEXT,
      standfirst TEXT,
      authorByline TEXT,
      directQuotes TEXT,
      quotesWithAttribution TEXT,
      evidenceDepth TEXT,
      editorialFraming TEXT,
      framingLens TEXT,
      narrativeSummary TEXT,
      framingStrategy TEXT,
      emphasized TEXT,
      downplayed TEXT,
      publishedAt TEXT,
      domain TEXT,
      canonicalDomain TEXT,
      sourceIntegrity TEXT,
      sourceType TEXT,
      evidenceLabel TEXT,
      confidenceScore INTEGER,
      imageUrl TEXT,
      republishedOutlets TEXT,
      syndicatedAgency TEXT,
      bodyWordCount INTEGER,
      extractionStatus TEXT,
      FOREIGN KEY(storyId) REFERENCES stories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS timeline_events (
      id TEXT PRIMARY KEY,
      storyId TEXT NOT NULL,
      step TEXT,
      time TEXT,
      date TEXT,
      title TEXT,
      description TEXT,
      primarySource TEXT,
      sourceUrl TEXT,
      isWire INTEGER,
      FOREIGN KEY(storyId) REFERENCES stories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS live_wire (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      source TEXT,
      bias TEXT,
      url TEXT UNIQUE NOT NULL,
      timestamp TEXT,
      category TEXT,
      region TEXT,
      status TEXT,
      relatedStoryId TEXT,
      summary TEXT
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS live_wire_fts USING fts5(
      id UNINDEXED,
      title,
      summary,
      source,
      url UNINDEXED
    );

    CREATE TRIGGER IF NOT EXISTS live_wire_ai AFTER INSERT ON live_wire BEGIN
      INSERT INTO live_wire_fts(id, title, summary, source, url) VALUES (new.id, new.title, new.summary, new.source, new.url);
    END;

    CREATE TRIGGER IF NOT EXISTS live_wire_ad AFTER DELETE ON live_wire BEGIN
      DELETE FROM live_wire_fts WHERE id = old.id;
    END;

    CREATE TRIGGER IF NOT EXISTS live_wire_au AFTER UPDATE ON live_wire BEGIN
      DELETE FROM live_wire_fts WHERE id = old.id;
      INSERT INTO live_wire_fts(id, title, summary, source, url) VALUES (new.id, new.title, new.summary, new.source, new.url);
    END;

    CREATE TABLE IF NOT EXISTS fact_checks (
      id TEXT PRIMARY KEY,
      claim TEXT NOT NULL,
      verdict TEXT NOT NULL,
      verdictDetail TEXT,
      primaryReportingOutlet TEXT,
      corroboratingSources TEXT,
      evidenceTrail TEXT,
      divergence TEXT,
      confidenceScore INTEGER,
      timestamp TEXT NOT NULL,
      status TEXT,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS ai_cache (
      id TEXT PRIMARY KEY,
      entities TEXT,
      predicate TEXT,
      geoOrigin TEXT,
      publisherTier TEXT,
      embedding TEXT,
      timestamp TEXT
    );
    CREATE TABLE IF NOT EXISTS ai_story_synthesis_cache (
      hash TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS story_clusters (
      id TEXT PRIMARY KEY,
      edition_date TEXT NOT NULL,
      beat_category TEXT NOT NULL,
      paperback_headline TEXT NOT NULL,
      what_happened TEXT NOT NULL,
      established_facts TEXT NOT NULL DEFAULT '[]',
      unclear_context TEXT NOT NULL DEFAULT '[]',
      narrative_synthesis TEXT NOT NULL,
      total_sources INTEGER NOT NULL,
      independent_sources INTEGER NOT NULL,
      wire_sources INTEGER NOT NULL,
      importance_score REAL NOT NULL,
      page_one_rank REAL NOT NULL,
      is_published INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      cluster_id TEXT NOT NULL,
      outlet_id TEXT NOT NULL,
      outlet_name TEXT NOT NULL,
      ownership_group TEXT NOT NULL,
      original_headline TEXT NOT NULL,
      canonical_url TEXT UNIQUE NOT NULL,
      author_byline TEXT,
      published_at TEXT NOT NULL,
      is_independent INTEGER NOT NULL,
      framing_dimension TEXT NOT NULL,
      emphasized_angle TEXT NOT NULL,
      omitted_facts TEXT DEFAULT '[]',
      minhash_signature TEXT NOT NULL,
      FOREIGN KEY(cluster_id) REFERENCES story_clusters(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_clusters_edition ON story_clusters(edition_date, is_published);
    CREATE INDEX IF NOT EXISTS idx_clusters_importance ON story_clusters(importance_score DESC);
    CREATE INDEX IF NOT EXISTS idx_articles_cluster ON articles(cluster_id);
    CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(canonical_url);
  `);
  
  // Safe backfill for FTS5 (Priority 1 fix)
  await db.exec(`
      INSERT INTO live_wire_fts (id, title, summary, source, url)
      SELECT id, title, summary, source, url FROM live_wire
      WHERE id NOT IN (SELECT id FROM live_wire_fts)
  `);

  try { await db.exec('ALTER TABLE stories ADD COLUMN evidenceTrail TEXT'); } catch (e) {}
  try { await db.exec('ALTER TABLE stories ADD COLUMN divergenceMap TEXT'); } catch (e) {}
  try { await db.exec('ALTER TABLE stories ADD COLUMN primaryReportingOutlet TEXT'); } catch (e) {}
  try { await db.exec('ALTER TABLE stories ADD COLUMN dataAudit TEXT'); } catch (e) {}
  try { await db.exec('ALTER TABLE stories ADD COLUMN velocityMetrics TEXT'); } catch (e) {}
  try { await db.exec('ALTER TABLE stories ADD COLUMN status TEXT DEFAULT "ACTIVE"'); } catch (e) {}
  try { await db.exec('ALTER TABLE stories ADD COLUMN updatedAt TEXT'); } catch (e) {}
  try { await db.exec('ALTER TABLE stories ADD COLUMN importanceScore INTEGER'); } catch (e) {}
  try { await db.exec('ALTER TABLE stories ADD COLUMN breadthScore INTEGER'); } catch (e) {}
  try { await db.exec('ALTER TABLE stories ADD COLUMN velocityScore INTEGER'); } catch (e) {}
  try { await db.exec('ALTER TABLE stories ADD COLUMN impactScore INTEGER'); } catch (e) {}
  try { await db.exec('ALTER TABLE stories ADD COLUMN divergenceScore INTEGER'); } catch (e) {}
  try { await db.exec('ALTER TABLE stories ADD COLUMN regionalGapScore INTEGER'); } catch (e) {}
  try { await db.exec('ALTER TABLE stories ADD COLUMN pageOneRank INTEGER'); } catch (e) {}

  // Phase 3 extensions
  try { await db.exec('ALTER TABLE live_wire ADD COLUMN language TEXT'); } catch (e) {}
  try { await db.exec('ALTER TABLE live_wire ADD COLUMN state TEXT'); } catch (e) {}
  try { await db.exec('ALTER TABLE live_wire ADD COLUMN canonicalUrl TEXT'); } catch (e) {}
  try { await db.exec('ALTER TABLE live_wire ADD COLUMN extractionStatus TEXT'); } catch (e) {}
  try { await db.exec('ALTER TABLE live_wire ADD COLUMN sourceDomain TEXT'); } catch (e) {}
  try { await db.exec('ALTER TABLE live_wire ADD COLUMN languageConfidence REAL'); } catch (e) {}
  try { await db.exec('ALTER TABLE perspectives ADD COLUMN extractionStatus TEXT'); } catch (e) {}

  return db;
}

export default dbPromise;
