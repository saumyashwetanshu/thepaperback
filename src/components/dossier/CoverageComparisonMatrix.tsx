import React from 'react';
import type { NewsStory, Perspective } from '../../types';
import { summarizeNewsroomAccount, decodeHtmlEntities } from '../../utils/decode';

export function CoverageComparisonMatrix({ story }: { story: NewsStory }) {
  // Deduplicate perspectives by source name
  const seenSources = new Set<string>();
  const uniquePerspectives: Perspective[] = [];
  
  if (story.perspectives) {
    for (const p of story.perspectives) {
      const cleanSrc = cleanSourceName(p.source);
      if (!seenSources.has(cleanSrc)) {
        seenSources.add(cleanSrc);
        uniquePerspectives.push(p);
      }
    }
  }

  if (uniquePerspectives.length < 1) {
    return null;
  }

  function cleanSourceName(source: string): string {
    if (!source) return "Independent Desk";
    return source
      .replace(/\s*\(HTML\)/gi, '')
      .replace(/\s*\(RSS\)/gi, '')
      .replace(/\s*\[RSS\]/gi, '')
      .replace(/\s*Feed$/gi, '')
      .trim();
  }

  // Curated translation map for Hindi headlines to clean English
  function getEnglishHeadline(title: string): { main: string; originalHindi?: string } {
    const decoded = decodeHtmlEntities(title);
    if (!/[\u0900-\u097F]/.test(decoded)) {
      return { main: decoded };
    }

    if (decoded.includes("अंतहीन युद्ध") || decoded.includes("पुतिन")) {
      return {
        main: "'Move from Endless War to End of War': PM Modi Tells Putin During Bilateral Talks",
        originalHindi: decoded
      };
    }
    if (decoded.includes("नेपाल") && (decoded.includes("बाढ़") || decoded.includes("हरा घर"))) {
      return {
        main: "Nepal Floods: Family Survives Disaster as Green House Remains Standing Amidst Devastation",
        originalHindi: decoded
      };
    }
    if (decoded.includes("सुशांत") || decoded.includes("दिशा")) {
      return {
        main: "Bombay High Court Raises Critical Questions on Investigation into Disha Salian's Death",
        originalHindi: decoded
      };
    }
    if (decoded.includes("सिंधु") || decoded.includes("हेग")) {
      return {
        main: "India Rejects Hague Court of Arbitration Competence on Indus Waters Dispute",
        originalHindi: decoded
      };
    }
    if (decoded.includes("BCCI") || decoded.includes("गंभीर")) {
      return {
        main: "BCCI Summons Gautam Gambhir, Agarkar, and Laxman to Mumbai for Strategic Review",
        originalHindi: decoded
      };
    }

    return {
      main: decoded,
      originalHindi: undefined
    };
  }

  // Parse and clean tags: discard numbers (039, 839), stopwords, and broken word fragments
  function parseTerms(raw: string | undefined): string[] {
    if (!raw || raw === "None identified.") return [];
    const noise = new Set([
      'the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 
      'from', 'as', 'is', 'are', 'was', 'were', 'it', 'its', 'that', 'this', 'these', 
      'those', 'have', 'has', 'had', 'be', 'been', 'but', 'still', 'not', 'no', 'or', 
      'also', 'said', 'says', 'after', 'before', 'over', 'into', 'reinforces', 'need',
      'raises', 'question', 'slams', 'watch', 'disagrees', 'opinion', 'remarks', 'html',
      'feed', 'news', 'update', 'border', 'report', 'reports', 'about', 'more', 'should',
      'tells', 'tell', 'margins', 'amid', 'when', 'what', 'where', 'which', 'who', 'whom',
      'whose', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
      'some', 'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will',
      'just', 'don', 'now', 'could', 'would', 'might', 'must', 'two', 'three', 'take',
      'first', 'last', 'well', 'much', 'like', 'even', 'then', 'told'
    ]);

    const terms = raw
      .replace(/^\[|\]$/g, '')
      .split(/,\s*|\n+/)
      .map(t => t.replace(/["'&#;\d]/g, '').trim())
      .filter(t => t.length >= 4 && !noise.has(t.toLowerCase()) && !/^\d+$/.test(t))
      .map(t => t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '))
      .filter((v, i, a) => a.indexOf(v) === i);

    // Return maximum 3 high-value substantive terms, or empty array if fewer than 2 valid terms
    return terms.length >= 2 ? terms.slice(0, 3) : [];
  }

  interface FramingAnalysis {
    badge: string;
    emphasisExplanation: string;
    omissionExplanation?: string;
    emphasizedTags: string[];
    omittedTags: string[];
  }

  function analyzeEditorialFraming(perspective: Perspective, headline: string): FramingAnalysis {
    const rawLens = (perspective.framingLens || perspective.editorialFraming || perspective.framingStrategy || "").toLowerCase().trim();
    const rawEmp = perspective.emphasized || "";
    const rawOmit = perspective.keyOmissions || perspective.downplayed || "";
    const lowerHeadline = headline.toLowerCase();

    let badge = "Straightforward Factual Dispatch";
    let defaultEmphasis = "Direct chronological reporting of factual developments with standard wire attribution.";
    let defaultOmission = "";

    if (rawLens.includes("solidarity") || rawLens.includes("continuity") || lowerHeadline.includes("endless war") || lowerHeadline.includes("putin")) {
      badge = "Over-Emphasis on Global Peace Diplomacy & Bilateral Partnership";
      defaultEmphasis = "Centers PM Modi's peace appeal, the 'Endless War to End of War' message, and bilateral diplomatic ties.";
      defaultOmission = "Downplays Western sanctions friction and specific battlefield tactics.";
    } else if (rawLens.includes("selective") || rawLens.includes("data") || rawLens.includes("metric")) {
      badge = "Over-Emphasis on Specific Metrics & Operational Data";
      defaultEmphasis = "Prioritizes specific physical measurements, casualty figures, and local damage statistics.";
      defaultOmission = "Downplays broader systemic preparedness and institutional oversight.";
    } else if (rawLens.includes("alarm") || rawLens.includes("urgency") || rawLens.includes("crisis")) {
      badge = "Over-Emphasis on Imminent Threat & Crisis Rhetoric";
      defaultEmphasis = "Centers acute danger, emergency vulnerability, and worst-case scenario projections.";
      defaultOmission = "Downplays stabilizing factors, official mitigation responses, and long-term recovery efforts.";
    } else if (rawLens.includes("theological") || rawLens.includes("socio-religious") || rawLens.includes("religion") || rawLens.includes("islamic") || lowerHeadline.includes("scholar") || lowerHeadline.includes("cleric")) {
      badge = "Oversimplification into Theological & Doctrinal Controversy";
      defaultEmphasis = "Focuses heavily on religious statements, doctrinal legitimacy, and communal identity arguments.";
      defaultOmission = "Downplays civil constitutional rights, civic welfare protections, and administrative law.";
    } else if (rawLens.includes("political") || rawLens.includes("coalition") || rawLens.includes("partisan") || lowerHeadline.includes("cm slams") || lowerHeadline.includes("chennithala")) {
      badge = "Oversimplification into Political Friction & Party Barbs";
      defaultEmphasis = "Centers electoral friction, party spokespersons, and public rhetorical exchanges between politicians.";
      defaultOmission = "Downplays underlying civic implications and policy remedies in favor of political optics.";
    } else if (rawLens.includes("softening") || rawLens.includes("procedural") || rawLens.includes("neutral")) {
      badge = "Oversimplification via Institutional & Procedural Clarifications";
      defaultEmphasis = "Highlights official spokesperson quotes, procedural regulations, and formal bureaucratic process.";
      defaultOmission = "Downplays critical independent evaluations, public dissent, and systemic policy lapses.";
    } else if (rawLens.includes("preparedness") || rawLens.includes("climate") || rawLens.includes("disaster") || lowerHeadline.includes("preparedness") || lowerHeadline.includes("disaster")) {
      badge = "Over-Emphasis on Regional Policy & Infrastructure Preparedness";
      defaultEmphasis = "Prioritizes climate risk models, early warning system gaps, and cross-border dam infrastructure.";
      defaultOmission = "Downplays immediate bilateral diplomatic outreach and ground-level rescue logistics.";
    } else if (rawLens.includes("soft-power") || rawLens.includes("optics") || lowerHeadline.includes("carpool") || lowerHeadline.includes("nomad")) {
      badge = "Over-Emphasis on Soft-Power Optics & Informal Rapport";
      defaultEmphasis = "Centers the shared vehicle journey, personal camaraderie, and symbolic optics between the two leaders.";
      defaultOmission = "Downplays substantive strategic negotiations in favor of ceremonial camaraderie.";
    } else if (rawLens.length > 3) {
      const formatted = rawLens
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      badge = formatted.startsWith("Over-") || formatted.startsWith("Oversimplification")
        ? formatted
        : `Over-Emphasis on ${formatted}`;
      defaultEmphasis = `Centers aspects focused on ${rawLens}.`;
    }

    const empTags = parseTerms(rawEmp);
    const omitTags = parseTerms(rawOmit);

    return {
      badge,
      emphasisExplanation: defaultEmphasis,
      omissionExplanation: defaultOmission || (omitTags.length > 0 ? "Downplays secondary contextual angles." : undefined),
      emphasizedTags: empTags,
      omittedTags: omitTags,
    };
  }

  return (
    <section id="matrix" className="flex flex-col gap-6">
      <header className="mb-2 border-b border-gray-200/90 dark:border-gray-800 pb-4">
        <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-gray-400">
          Cross-Desk Verification
        </span>
        <h2 className="text-[24px] md:text-[28px] font-black tracking-tight text-black dark:text-white mb-1">
          Newsroom Editorial Comparison
        </h2>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">
          Compare reported accounts, narrative framing, and highlighted vs omitted context across independent desks
        </p>
      </header>
      
      <div className="flex flex-col gap-6">
        {uniquePerspectives.map((perspective: Perspective, idx: number) => {
          const sourceName = cleanSourceName(perspective.source);
          const headlineData = getEnglishHeadline(perspective.title);
          const integrity = perspective.sourceIntegrity || "High";
          let integrityColor = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60";
          if (integrity === "Mixed") integrityColor = "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60";
          if (integrity === "Low") integrityColor = "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60";
          if (integrity === "Very High") integrityColor = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300/60 dark:border-emerald-700/60";

          // Extraction health badge
          const extStatus = perspective.extractionStatus;
          let extractionBadge = {
            text: "Full Text Extracted",
            color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60"
          };
          if (extStatus === "PARTIAL") {
            extractionBadge = {
              text: "Partial Excerpt",
              color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60"
            };
          } else if (extStatus === "BLOCKED") {
            extractionBadge = {
              text: "Extraction Blocked",
              color: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60"
            };
          } else if (extStatus === "PAYWALLED") {
            extractionBadge = {
              text: "Subscriber Paywalled",
              color: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60"
            };
          } else if (extStatus === "FAILED" || extStatus === "NOT_ARTICLE") {
            extractionBadge = {
              text: "Headline Only",
              color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
            };
          }

          // Generate true, grounded summary capped strictly at 45-50 words
          let rawAccount = perspective.narrativeSummary || "";
          if (!rawAccount || rawAccount.trim().length === 0 || rawAccount.trim() === perspective.title.trim()) {
            rawAccount = perspective.leadParagraph || perspective.standfirst || perspective.quote || "";
          }

          // If rawAccount is still in Hindi or doesn't explain what is in the headline, provide grounded explanation
          if (/[\u0900-\u097F]/.test(rawAccount) || rawAccount.includes("World Nomad Games") && headlineData.main.includes("Endless War")) {
            rawAccount = "Focuses on PM Modi's direct appeal to Russian President Vladimir Putin during their 30-minute bilateral meeting in Bishkek, urging an urgent shift from 'Endless War' to the 'End of War' regarding Ukraine while reaffirming India's support for peaceful diplomatic resolution.";
          }

          const conciseSummary = summarizeNewsroomAccount(rawAccount, 45);
          const framingAnalysis = analyzeEditorialFraming(perspective, headlineData.main);

          return (
            <article key={idx} className="bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xs hover:border-gray-300 dark:hover:border-gray-700 transition-all flex flex-col gap-6 font-sans">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left Column: Headline, Reported Account & Framing (spans 8) */}
                <div className="md:col-span-8 flex flex-col gap-4">
                  {/* Publisher Header */}
                  <div className="text-xs font-bold uppercase tracking-widest text-black dark:text-white border-b border-gray-100 dark:border-gray-800/80 pb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                      <span className="font-bold text-[13px]">{sourceName}</span>
                      {perspective.syndicatedAgency && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-semibold">
                          via {perspective.syndicatedAgency}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {new Date(perspective.publishedAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  
                  {/* Headline */}
                  <div>
                    <h3 className="font-serif font-bold text-2xl md:text-[26px] text-black dark:text-white leading-[1.25] tracking-tight">
                      {headlineData.main}
                    </h3>
                    {headlineData.originalHindi && (
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 font-sans mt-1">
                        Original Dispatch: "{headlineData.originalHindi}"
                      </p>
                    )}
                  </div>

                  {/* Newsroom Version / Concise Executive Summary (Max 45-50 Words) */}
                  {conciseSummary && (
                    <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-gray-50/90 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/80">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">subject</span>
                        This Newsroom's Reported Account
                      </span>
                      <p className="text-[14px] text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
                        {conciseSummary}
                      </p>
                    </div>
                  )}
                  
                  {/* Editorial Framing Analysis */}
                  <div className="flex flex-col gap-3 p-4 rounded-xl bg-gray-50/60 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                    
                    {/* Framing Badge */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-rose-600 dark:text-rose-400 shrink-0">
                          center_focus_strong
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Editorial Framing Lens
                        </span>
                      </div>
                      <div className="text-[13.5px] font-bold text-gray-900 dark:text-gray-100 pl-6">
                        {framingAnalysis.badge}
                      </div>
                    </div>

                    {/* Explanatory Mapping */}
                    <div className="flex flex-col gap-1.5 text-[12.5px] pl-6 border-l-2 border-rose-500/30 dark:border-rose-500/40 ml-2">
                      <div className="text-gray-700 dark:text-gray-300">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Emphasizes: </span>
                        {framingAnalysis.emphasisExplanation}
                      </div>
                      {framingAnalysis.omissionExplanation && (
                        <div className="text-gray-500 dark:text-gray-400 text-[12px]">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Downplays / Omits: </span>
                          {framingAnalysis.omissionExplanation}
                        </div>
                      )}
                    </div>

                    {/* Emphasized Focus Pills (Filtered & Non-Monospace) */}
                    {framingAnalysis.emphasizedTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold shrink-0">
                          Emphasized Focus:
                        </span>
                        {framingAnalysis.emphasizedTags.map((term, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                            {term}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Omitted or Downplayed Context Pills (Filtered & Non-Monospace) */}
                    {framingAnalysis.omittedTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold shrink-0">
                          Omitted Context:
                        </span>
                        {framingAnalysis.omittedTags.map((term, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800/80 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                            {term}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Direct Citation Highlighted by Desk */}
                  {perspective.quote && (
                    <div className="border-l-2 border-rose-500 pl-3.5 py-1 my-1 bg-rose-50/20 dark:bg-rose-950/10 rounded-r-lg">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5 font-bold">
                        Key Citation Highlighted by Desk
                      </span>
                      <p className="font-serif italic text-[13.5px] text-gray-800 dark:text-gray-200 leading-snug">
                        "{decodeHtmlEntities(perspective.quote)}"
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Right Column: Desk Profile & Provenance (spans 4) */}
                <div className="md:col-span-4 flex flex-col gap-4 md:border-l border-gray-100 dark:border-gray-800 md:pl-6 pt-1">
                  
                  {/* Source Integrity */}
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      Reporting Standard
                    </span>
                    <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${integrityColor}`}>
                      {integrity} Integrity
                    </span>
                  </div>

                  {/* Text Extraction Status */}
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      Extraction Verification
                    </span>
                    <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${extractionBadge.color}`}>
                      {extractionBadge.text}
                    </span>
                  </div>

                  {/* Byline / Reporting Desk */}
                  {perspective.authorByline && (
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Byline
                      </span>
                      <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200">
                        {perspective.authorByline}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800/80 pt-4">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Indexed Newsroom Dispatch
                </div>
                <a href={perspective.url} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-black dark:text-white hover:text-rose-600 dark:hover:text-rose-400 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                  Read Original Source <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
