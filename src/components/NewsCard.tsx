import React, { useState } from "react";
import { NewsStory } from "../types";
import { Share2, ExternalLink, ShieldCheck, Sparkles, ArrowLeft, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NewsCardProps {
  key?: React.Key;
  story: NewsStory;
  isExpandedInitial?: boolean;
  onBack?: () => void;
  onSelect?: () => void;
}

export function NewsCard({ story, isExpandedInitial = false, onBack, onSelect }: NewsCardProps) {
  const [isExpanded, setIsExpanded] = useState(isExpandedInitial);
  const [activeDeNoiserPublisher, setActiveDeNoiserPublisher] = useState<string | null>(null);

  // Sync state if initial prop changes
  React.useEffect(() => {
    setIsExpanded(isExpandedInitial);
  }, [isExpandedInitial]);

  const handleBack = () => {
    setIsExpanded(false);
    if (onBack) onBack();
  };

  const handleCardClick = () => {
    setIsExpanded(true);
    if (onSelect) onSelect();
  };

  const toggleDeNoiser = (publisherSource: string) => {
    if (activeDeNoiserPublisher === publisherSource) {
      setActiveDeNoiserPublisher(null);
    } else {
      setActiveDeNoiserPublisher(publisherSource);
    }
  };

  // --- COLLAPSED STORY CARD VIEW ---
  if (!isExpanded) {
    return (
      <div 
        onClick={handleCardClick}
        className="group bg-white border border-stone-200/80 rounded-[28px] p-6 cursor-pointer hover:border-stone-400 hover:shadow-md transition-all duration-300 text-left select-none flex flex-col gap-4"
      >
        <div className="flex items-center justify-between font-mono text-[9px] tracking-widest uppercase text-stone-500 font-bold">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded border border-stone-200">
              {story.category}
            </span>
            {story.region && (
              <span className="bg-stone-50 text-stone-600 px-2 py-0.5 rounded border border-stone-200/60">
                {story.region}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[8px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded border border-emerald-200">
              {story.perspectives.length} PUBLISHERS AUDITED
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-stone-950 text-lg sm:text-xl font-bold tracking-tight leading-snug group-hover:text-indigo-600 transition-colors duration-200 mb-2.5">
            {story.title}
          </h3>
          <p className="text-stone-700 text-sm font-sans leading-relaxed">
            {story.description}
          </p>
        </div>

        {/* Verifiable Consensus Preview Pill */}
        <div className="bg-[#ECFDF5] border border-emerald-200/80 p-4 rounded-2xl text-xs sm:text-sm font-sans text-emerald-950 flex items-start gap-3">
          <ShieldCheck className="h-4 w-4 text-[#047857] flex-shrink-0 mt-0.5" />
          <div className="line-clamp-3">
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-wider text-[#047857] block mb-1">
              VERIFIABLE CONSENSUS PREVIEW:
            </span>
            {story.verifiableConsensus}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 pt-3 font-mono text-[9px] text-stone-500 font-semibold">
          <span className="text-stone-900 font-extrabold uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            OPEN STORY INTELLIGENCE CANVAS &rarr;
          </span>
          <span>{story.date}</span>
        </div>
      </div>
    );
  }

  // --- EXPANDED STORY INTELLIGENCE CANVAS ---
  return (
    <div className="space-y-6 text-left w-full max-w-full animate-fade-in">
      
      {/* Back Button Navigation Row */}
      <div className="flex items-center justify-between">
        <button 
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-3xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-stone-900" />
          <span>Back to Feed</span>
        </button>

        <div className="flex items-center gap-2 font-mono text-[9px] text-stone-500 font-bold uppercase">
          <span className="bg-stone-100 text-stone-800 px-2.5 py-1 rounded border border-stone-200">
            {story.category}
          </span>
          <span>{story.date}</span>
        </div>
      </div>

      {/* Story Master Title Header */}
      <div className="bg-white border border-stone-200/80 rounded-[28px] p-6 sm:p-8 space-y-3 shadow-2xs">
        <div className="font-mono text-[10px] font-extrabold tracking-widest text-stone-400 uppercase">
          STORY INTELLIGENCE &bull; {story.perspectives.length} NEWSROOMS AUDITED
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-black text-stone-950 leading-tight">
          {story.title}
        </h2>
        <p className="text-stone-700 text-sm sm:text-base font-sans leading-relaxed pt-1">
          {story.description}
        </p>
      </div>

      {/* CARD 1: VERIFIABLE CONSENSUS */}
      <div className="bg-[#ECFDF5] border border-emerald-200/80 rounded-[28px] p-6 sm:p-8 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 font-mono text-[11px] font-extrabold tracking-widest text-[#047857] uppercase">
          <ShieldCheck className="h-4 w-4 text-[#047857]" />
          <span>VERIFIABLE CONSENSUS</span>
        </div>
        <p className="font-serif text-[#064E3B] text-base sm:text-lg leading-relaxed font-medium">
          {story.verifiableConsensus}
        </p>
      </div>

      {/* CARD 2: NARRATIVE LANDSCAPE */}
      <div className="bg-[#EEF2FF] border border-indigo-200/80 rounded-[28px] p-6 sm:p-8 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 font-mono text-[11px] font-extrabold tracking-widest text-[#4338CA] uppercase">
          <Sparkles className="h-4 w-4 text-[#4338CA]" />
          <span>NARRATIVE LANDSCAPE</span>
        </div>
        <p className="font-serif text-[#1E1B4B] text-sm sm:text-base leading-relaxed font-normal">
          {story.narrativeLandscape}
        </p>
      </div>

      {/* AUDITED PUBLISHER FRAMING CARDS */}
      <div className="space-y-6 pt-2">
        <div className="grid grid-cols-1 gap-6">
          {story.perspectives.map((perspective, idx) => {
            const isDeNoiserOpen = activeDeNoiserPublisher === perspective.source;
            const integrity = perspective.sourceIntegrity || (perspective.reliability === "high" ? "Canonical" : "Audited");
            
            return (
              <div 
                key={idx}
                className="bg-white rounded-[28px] border border-stone-200/90 shadow-2xs overflow-hidden text-left"
              >
                {/* Header Banner (Dark Header) */}
                <div className="bg-[#0B0F19] text-white p-4 sm:p-5 rounded-t-[28px] flex items-start justify-between gap-4">
                  <div className="font-mono text-[10px] sm:text-[11px] tracking-wider uppercase font-bold leading-relaxed text-stone-200">
                    <span className="text-stone-400 font-extrabold mr-2">EDITORIAL FRAMING:</span>
                    {perspective.framingLens?.toUpperCase() || "EXCLUSIVELY RELIES ON OFFICIAL PRESS RELEASE STATEMENTS."}
                  </div>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: perspective.title, url: perspective.url });
                      }
                    }}
                    className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                    title="Share Analysis"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>

                {/* White Card Body */}
                <div className="bg-white border border-stone-200 border-t-0 rounded-b-[28px] p-6 sm:p-8 space-y-6">
                  
                  {/* Top Meta Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                    {/* Left: Source Integrity Badge */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">
                        SOURCE INTEGRITY
                      </span>
                      <span className={`px-4 py-1 rounded-full text-xs font-bold ${
                        integrity.toLowerCase().includes("canonical") || integrity.toLowerCase().includes("very high")
                          ? "bg-[#E6F4EA] text-[#137333]"
                          : "bg-[#E8F0FE] text-[#1A73E8]"
                      }`}>
                        {integrity}
                      </span>
                    </div>

                    {/* Right: Source Name & Bias Meter */}
                    <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] font-bold">
                      <span className="font-serif font-bold text-lg text-stone-900">
                        {perspective.source}
                      </span>
                      <span className="text-stone-300">|</span>
                      <span className="text-stone-500">
                        INCLINATION: <strong className="text-stone-900">{perspective.bias.toUpperCase()}</strong>
                      </span>
                      <span className="bg-[#EEF2FF] text-[#4F46E5] px-3 py-1 rounded-full text-[10px] font-mono font-bold">
                        ANALYTICAL CONFIDENCE: {perspective.confidenceScore || 90}%
                      </span>
                    </div>
                  </div>

                  {/* Headline Title */}
                  <h4 className="font-serif font-bold text-xl sm:text-2xl text-stone-950 leading-snug">
                    {perspective.title}
                  </h4>

                  {/* Narrative Summary Inset Quote Box */}
                  <div className="bg-[#F8F9FA] border border-stone-200/80 rounded-2xl p-4 space-y-1">
                    <span className="text-stone-400 font-mono text-[9px] font-extrabold tracking-widest uppercase block">
                      NARRATIVE SUMMARY
                    </span>
                    <p className="font-serif italic text-stone-800 text-sm leading-relaxed">
                      &ldquo;{perspective.narrativeSummary || perspective.quote}&rdquo;
                    </p>
                  </div>

                  {/* The Framing Lens Explanation */}
                  <div className="space-y-1">
                    <span className="text-[#4F46E5] font-mono text-[10px] font-extrabold tracking-widest uppercase block">
                      THE FRAMING LENS
                    </span>
                    <p className="font-serif text-stone-800 text-sm sm:text-base leading-relaxed">
                      {perspective.framingLens || "Exclusively relies on a government press release (PIB) without questioning timing or secondary indicators."}
                    </p>
                  </div>

                  {/* Narrative De-Noiser Action Button */}
                  <div>
                    <button
                      onClick={() => toggleDeNoiser(perspective.source)}
                      className={`py-3.5 px-6 rounded-2xl font-mono text-[11px] font-extrabold uppercase tracking-wider w-full flex justify-center items-center gap-2 transition-all cursor-pointer ${
                        isDeNoiserOpen
                          ? "bg-[#111827] text-white hover:bg-black"
                          : "bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5]"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isDeNoiserOpen ? "HIDE ANALYSIS" : "NARRATIVE DE-NOISER"}</span>
                    </button>
                  </div>

                  {/* FORENSIC NARRATIVE AUDIT PANEL */}
                  <AnimatePresence>
                    {isDeNoiserOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pt-2"
                      >
                        <div className="bg-[#F5F7FF] border border-indigo-100 rounded-3xl p-6 space-y-5 text-left">
                          
                          {/* Audit Header Row */}
                          <div className="flex items-center justify-between border-b border-indigo-100/80 pb-3">
                            <span className="text-[#4F46E5] font-mono text-[11px] font-extrabold tracking-widest uppercase flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              FORENSIC NARRATIVE AUDIT
                            </span>
                            <span className="bg-[#EEF2FF] text-[#4F46E5] px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase">
                              DE-NOISER ACTIVE
                            </span>
                          </div>

                          {/* Framing Strategy Breakdown */}
                          <div className="space-y-1">
                            <span className="text-stone-500 font-mono text-[9px] font-extrabold tracking-widest uppercase block">
                              FRAMING STRATEGY
                            </span>
                            <p className="font-serif text-stone-800 text-sm leading-relaxed">
                              {perspective.forensicAudit?.framingStrategy || 
                               `${perspective.source} adopts a reporting stance that reflects official state data while setting secondary caveats in subsequent sections.`}
                            </p>
                          </div>

                          {/* Narrative Discrepancies Box */}
                          <div className="space-y-1.5">
                            <span className="text-amber-800 font-mono text-[9px] font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                              NARRATIVE DISCREPANCIES
                            </span>

                            <div className="bg-[#FFF5F5] border border-rose-200/60 p-4 rounded-2xl space-y-1.5">
                              {perspective.forensicAudit?.narrativeDiscrepancies?.map((disc, dIdx) => (
                                <div key={dIdx} className="font-serif text-xs leading-relaxed text-stone-800">
                                  <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase inline-block mr-2">
                                    {disc.type}
                                  </span>
                                  <span className="italic">{disc.description}</span>
                                </div>
                              )) || (
                                <div className="font-serif text-xs leading-relaxed text-stone-800">
                                  <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase inline-block mr-2">
                                    APPEAL TO AUTHORITY
                                  </span>
                                  <span className="italic">
                                    Presents government projections as definitive facts before international fiscal bodies have released final comparative annual data.
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer Protocol Ref */}
                          <div className="flex items-center justify-between font-mono text-[9px] text-stone-400 pt-2 border-t border-indigo-100/60 font-bold">
                            <span>MULTI-LENS VALIDATION</span>
                            <span>REF: PROTOCOL V2.6.4</span>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Card Bottom Row */}
                  <div className="border-t border-stone-100 pt-4 flex items-center justify-between font-mono text-[10px] text-stone-400">
                    <a 
                      href={perspective.url && perspective.url.startsWith("http") ? perspective.url : `/api/redirect-link?url=${encodeURIComponent(perspective.url)}&headline=${encodeURIComponent(perspective.title)}&source=${encodeURIComponent(perspective.source)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-extrabold text-[#4F46E5] hover:text-indigo-900 inline-flex items-center gap-1.5 uppercase tracking-wider py-1 px-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>READ DIRECT STORY</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <span className="text-stone-400 uppercase tracking-widest font-bold">
                      VERIFIED DIRECT STORY LINK
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

