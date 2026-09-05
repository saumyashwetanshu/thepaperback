export type SourceClassification = "ORIGINAL REPORTING" | "WIRE / SYNDICATED" | "ADAPTED WIRE" | "PROBABLE SYNDICATION" | "OFFICIAL / PRIMARY" | "OPINION / EDITORIAL" | "UNKNOWN";
export type EvidenceStatus = "ESTABLISHED / CORROBORATED" | "MULTIPLE INDEPENDENT REPORTS" | "WIRE-DERIVED / SYNDICATED" | "SINGLE-SOURCE" | "DEVELOPING";
export type EvidenceDepth = "FULL_ARTICLE" | "PARTIAL_ARTICLE" | "RSS_ONLY" | "PAYWALL" | "BLOCKED" | "EXTRACTION_FAILED";

export interface ExtractedQuote {
  quote: string;
  speaker?: string;
  attribution: string;
  paragraphIndex?: number;
}

export interface ExtractedEntities {
  people: string[];
  organisations: string[];
  places: string[];
  events: string[];
  explicitDates: string[];
}

/**
 * Temporal signal extracted from text.
 */
export interface TemporalSignal {
  text: string;           // Original extracted text
  normalized: string;     // ISO 8601 date/time or ISO 8601 duration
  type: 'DATE' | 'TIME' | 'DURATION' | 'SET' | 'PERIOD';
  confidence: number;     // 0.0 to 1.0
  snippet: string;        // Surrounding text for context
}

export interface StructuredClaim {
  claim: string;
  type: "FACTUAL_ASSERTION" | "ATTRIBUTED_STATEMENT" | "OPINION" | "PREDICTION";
  attribution?: string;
  sourceTextMatch?: string;
}

export interface NarrativeDenoiserOutput {
  whatHappened: string;
  confirmed: string[];
  claimed: string[];
  unclear: string[];
  divergenceReason?: string;
}

export interface ArticleEvidence {
  rawUrl: string;
  canonicalUrl?: string;
  publisher: string;
  publisherDomain?: string;
  headline: string;
  standfirst?: string;
  author?: string;
  publishedAt?: string;
  leadParagraph?: string;
  paragraphs: string[];
  bodyText?: string;
  quotes: ExtractedQuote[];
  evidenceDepth: EvidenceDepth;
  sourceType: SourceClassification;
  wireAgency?: string;
  retrievalStatus: "RESOLVED" | "CANONICAL_UNRESOLVED" | "FETCH_FAILED";
  extractedClaims?: StructuredClaim[];
  entities?: ExtractedEntities;
  paywallStatus?: "OPEN" | "PAYWALLED" | "UNKNOWN";
  syndicationRelationship?: { isSyndicated: boolean; overlap: number };
}

export interface ConsensusClaim {
  id?: string;
  claim: string;
  classification: "CORROBORATED" | "ATTRIBUTED" | "CONTESTED" | "SINGLE-SOURCE" | "WIRE-DERIVED" | "DEVELOPING";
  supportingOutlets: string[];
  quote?: string;
  sourceDocument?: string;
}

export interface Perspective {
  source: string;
  title: string;
  bias: "left" | "left-center" | "center" | "right-center" | "right" | string;
  inclinationLabel?: string;
  reliability?: "high" | "mixed" | "low";
  url: string;
  quote?: string;
  leadParagraph?: string;
  standfirst?: string;
  authorByline?: string;
  directQuotes?: string[];
  quotesWithAttribution?: ExtractedQuote[];
  evidenceDepth?: EvidenceDepth;
  editorialFraming?: string;
  framingLens?: string;
  narrativeSummary?: string;
  framingStrategy?: string;
  emphasized?: string;
  downplayed?: string;
  keyOmissions?: string;
  publishedAt?: string;
  domain?: string;
  canonicalDomain?: string;
  sourceIntegrity?: "High" | "Very High" | "Canonical" | "Standard" | "Mixed" | "Low";
  sourceType?: SourceClassification;
  evidenceLabel?: string;
  confidenceScore?: number;
  imageUrl?: string;
  republishedOutlets?: string[];
  syndicatedAgency?: string;
  bodyWordCount?: number;
  extractionStatus?: 'EXTRACTED' | 'PARTIAL' | 'PAYWALLED' | 'BLOCKED' | 'NOT_ARTICLE' | 'FAILED';
}

export interface BiasSpectrum {
  left: number;
  center: number;
  right: number;
}

export interface TimelineEvent {
  step: string;
  time: string;
  date: string;
  title: string;
  description: string;
  primarySource?: string;
  sourceUrl?: string;
  isWire?: boolean;
}

export interface FactCheckRecord {
  id: string;
  claim: string;
  verdict: string;
  verdictDetail?: string;
  primaryReportingOutlet?: string;
  corroboratingSources?: string[];
  evidenceTrail?: string;
  divergence?: string;
  confidenceScore?: number;
  timestamp: string;
  status?: string;
  category?: string;
}

export interface FramingBreakdown {
  left: string;
  center: string;
  right: string;
}

export interface NarrativeLandscapeDetails {
  leftNarrative: string;
  centerNarrative: string;
  rightNarrative: string;
  summary?: string;
  mainstreamVsIndependent?: string;
  regionalVsNational?: string;
  keyOmissions?: string;
}

export interface NewsStory {
  id: string;
  title: string;
  summary?: string;
  description: string;
  date: string;
  timestamp?: string;
  category: string;
  institution?: string;
  region?: string;
  regionType?: "northeast" | "himalayan" | "tribal" | "south" | "national";
  language?: string;
  imageUrl?: string;
  sourceUrl?: string;
  entities?: {
    people?: string[];
    institutions?: string[];
    laws?: string[];
    places?: string[];
    topics?: string[];
  };
  biasSpectrum?: BiasSpectrum;
  verifiableConsensus: string;
  contestedContext?: string;
  narrativeLandscape: string;
  narrativeDetails?: NarrativeLandscapeDetails;
  framingHighlights?: FramingBreakdown;
  whyItMatters?: string;
  primaryEvidence?: string[];
  pointsOfDisagreement?: string[];
  outstandingUncertainty?: string;
  readerTakeaway?: string;
  timeline?: TimelineEvent[];
  perspectives: Perspective[];
  blindspot?: "left" | "right" | "balanced";
  evidenceStatus?: EvidenceStatus;
  isSingleSource?: boolean;
  isWireDerived?: boolean;
  sourceCount?: number;
  independentReportingCount?: number;
  wireRepublishCount?: number;
  wireGroupings?: { agency: string; count: number; outlets: string[] }[];
  consensusClaims?: ConsensusClaim[];
  sharedFactualGround?: string;
  factualityScore?: number;
  sourceIntegrity?: "High" | "Very High" | "Canonical" | "Standard";
  mediaLiteracyInsight?: string;
  narrativeDivergence?: string;
  importanceScore?: number;
  pageOneRank?: number;
  breadthScore?: number;
  velocityScore?: number;
  impactScore?: number;
  divergenceScore?: number;
  regionalGapScore?: number;
  narrativeDenoiser?: NarrativeDenoiserOutput;
  metaSummary?: string;
  evidenceTrail?: string;
  divergenceMap?: string;
  primaryReportingOutlet?: string;
  dataAudit?: {
    metric: string;
    value: string;
    status: string;
    source: string;
  }[];
}

export interface LiveWireItem {
  id: string;
  title: string;
  source: string;
  bias: "left" | "left-center" | "center" | "right-center" | "right" | string;
  url: string;
  timestamp: string;
  category: string;
  region?: string;
  status: "Breaking" | "Developing" | "Verified" | "Indexed";
  relatedStoryId?: string;
  summary?: string;
  extractionStatus?: "EXTRACTED" | "PARTIAL" | "PAYWALLED" | "BLOCKED" | "NOT_ARTICLE" | "FAILED";
  canonicalUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  affiliation?: string;
  createdAt: string;
}

export interface NewsFeedResponse {
  success: boolean;
  query?: string;
  leadStory?: NewsStory;
  trendingRail?: NewsStory[];
  todaysEssentials?: NewsStory[];
  coverageDiffers?: NewsStory[];
  voicesOfIndia?: NewsStory[];
  otherDevelopments?: NewsStory[];
  wire?: LiveWireItem[];
  stories?: NewsStory[]; // search results only — omit on homepage
  pagination: { page: number; limit: number; total: number };
}



export type EvidenceClass =
  | "Primary Institutional"
  | "Direct Newsroom"
  | "Wire Service"
  | "Official Statement"
  | "Interview / Transcript"
  | "Public Dataset"
  | "Specialist Publication"
  | "Public Record"
  | "Gazette"
  | "Court Order"
  | "Constitution"
  | "Statute"
  | "Ministry Release"
  | "Regulatory Directive";

export interface PrimarySourceCitation {
  title: string;
  citation: string;
  type: EvidenceClass;
  url: string;
}

export interface SecondarySourceItem {
  publisher: string;
  headline: string;
  url: string;
  bias: "left" | "left-center" | "center" | "right-center" | "right" | string;
  date?: string;
}

export interface FactCheckClaim {
  id?: string;
  claim: string;
  verdict: "VERIFIED" | "FALSE" | "PARTIALLY VERIFIED" | "NEEDS CONTEXT" | "MISLEADING" | "TRUE" | string;
  verdictDetail: string;
  officialSource: string;
  primarySources: PrimarySourceCitation[];
  secondarySources: SecondarySourceItem[];
  evidencePoints: string[];
  historicalContext: string;
  confidenceScore: number;
}

export type FollowUpCategory =
  | "Court Directives"
  | "Policy Rollouts"
  | "Investigations"
  | "Environmental"
  | "Political Promises"
  | "Infrastructure Projects"
  | "Corporate & Economic"
  | "Scientific & Health"
  | "Elections & Governance"
  | "Public Controversies";

export interface FollowUpCase {
  id: string;
  topic: string;
  category: FollowUpCategory;
  originalEventDate: string;
  daysElapsed: number;
  status: "Report Pending" | "Charge Sheet Filed" | "Implemented" | "Review Ongoing" | "Ongoing" | "Fulfilled" | "Stalled" | "Under Investigation" | string;
  summary: string;
  latestUpdate: string;
  source: string;
  officialGazetteUrl?: string;
  primaryEvidenceUrl?: string;
  authorityInCharge: string;
  milestones: {
    day: string;
    title: string;
    description: string;
    verified: boolean;
  }[];
  groundReality: string;
  politicalClaim: string;
}

export type ThemeMode = "newsprint" | "light" | "dark";
export type LanguageCode = "en" | "hi" | "bn" | "ta" | "te" | "mr" | "kn" | "ml";
