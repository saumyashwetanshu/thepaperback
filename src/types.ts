export interface Perspective {
  source: string;
  title: string;
  bias: "left" | "center" | "right";
  reliability: "high" | "mixed" | "low";
  url: string;
  quote: string;
  framingLens?: string;
  narrativeSummary?: string;
  sourceIntegrity?: "High" | "Very High" | "Canonical" | "Standard";
  confidenceScore?: number;
  forensicAudit?: {
    framingStrategy: string;
    narrativeDiscrepancies: {
      type: string;
      description: string;
    }[];
    multiLensValidationRef?: string;
  };
}

export interface BiasSpectrum {
  left: number;
  center: number;
  right: number;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  primarySource?: string;
}

export interface NewsStory {
  id: string;
  title: string;
  description: string;
  date: string;
  timestamp?: string;
  category: "Politics" | "Economics" | "International Relations" | "Conflicts" | "Elections" | "Technology" | "Environment" | "Supreme Court" | "Parliament" | "RBI" | "State Governance" | "General";
  institution?: "Parliament" | "Supreme Court" | "RBI" | "Election Commission" | "Government" | "Cabinet" | "ISRO" | "DRDO" | "SEBI" | "NITI Aayog" | "State Government" | "International";
  region?: string;
  language?: string;
  entities?: {
    people?: string[];
    institutions?: string[];
    laws?: string[];
    places?: string[];
    topics?: string[];
  };
  biasSpectrum: BiasSpectrum;
  verifiableConsensus: string;
  narrativeLandscape: string;
  whyItMatters?: string;
  primaryEvidence?: string[];
  pointsOfDisagreement?: string[];
  outstandingUncertainty?: string;
  readerTakeaway?: string;
  timeline?: TimelineEvent[];
  perspectives: Perspective[];
  mediaLiteracyInsight?: string;
  readabilityScore?: number;
  imageUrl?: string;
  sentimentAnalysis?: {
    left: string;
    center: string;
    right: string;
  };
}

export interface LiveWireItem {
  id: string;
  title: string;
  source: string;
  bias: "left" | "center" | "right";
  url: string;
  timestamp: string;
  category: string;
  institution?: "Parliament" | "Supreme Court" | "RBI" | "Election Commission" | "Government" | "Cabinet" | "ISRO" | "DRDO" | "SEBI" | "NITI Aayog" | "State Government" | "International";
  status?: "Breaking" | "Developing" | "Verified";
  relatedStoryId?: string;
  summary?: string;
}

export interface FactCheckClaim {
  id: string;
  claim: string;
  verdict: "FALSE" | "VERIFIED" | "NEEDS CONTEXT" | "PARTIALLY VERIFIED";
  verdictDetail: string;
  officialSource: string;
  evidencePoints: string[];
  historicalContext: string;
  primaryDocuments?: { name: string; url: string }[];
  reasoning?: string;
  uncertainty?: string;
  confidenceScore: number;
}

export interface NewsStats {
  totalSourcesAnalyzed: number;
  biasDistribution: {
    left: number;
    center: number;
    right: number;
  };
}
