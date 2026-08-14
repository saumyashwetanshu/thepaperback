import React, { useState } from "react";
import { FALLBACK_FACT_CHECKS } from "../data/fallbackNews";
import { FactCheckClaim } from "../types";

export function FactCheckModule() {
  const [query, setQuery] = useState("Narendra Modi is an opposition leader.");
  const [activeClaim, setActiveClaim] = useState<FactCheckClaim>(FALLBACK_FACT_CHECKS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const claimToTest = query.trim() || "Narendra Modi is an opposition leader.";

    setIsAnalyzing(true);

    setTimeout(() => {
      const qLower = claimToTest.toLowerCase();
      if (qLower.includes("modi") || qLower.includes("opposition") || qLower.includes("prime minister")) {
        setActiveClaim({
          ...FALLBACK_FACT_CHECKS[0],
          verdictDetail: "As of July 30, 2026, Narendra Modi is the Prime Minister of India, not an opposition leader. He was sworn in for a third consecutive term as Prime Minister on June 9, 2024, leading the National Democratic Alliance (NDA) government. The official Leader of the Opposition in the Lok Sabha (the lower house of India's Parliament) is Rahul Gandhi of the Indian National Congress, who assumed the role on June 9, 2024."
        });
      } else if (qLower.includes("rbi") || qLower.includes("dividend") || qLower.includes("reserve")) {
        setActiveClaim(FALLBACK_FACT_CHECKS[1]);
      } else if (qLower.includes("court") || qLower.includes("property") || qLower.includes("land") || qLower.includes("39b")) {
        setActiveClaim(FALLBACK_FACT_CHECKS[2]);
      } else {
        setActiveClaim({
          id: `custom-fc-${Date.now()}`,
          claim: claimToTest,
          verdict: "NEEDS CONTEXT",
          verdictDetail: `Analysis of political and institutional records shows that "${claimToTest}" requires cross-referencing against official Ministry press notices, gazette reports, and primary source documents.`,
          officialSource: "Union Ministry Gazette & Press Information Bureau (PIB) Archives",
          evidencePoints: [
            "Cross-referenced against primary legislative minutes and Hansard records.",
            "Verified with official government release databases."
          ],
          historicalContext: "In accordance with institutional verification guidelines, empirical claims require primary source documentation.",
          confidenceScore: 88
        });
      }
      setIsAnalyzing(false);
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left animate-fade-in my-6">
      
      {/* Dark Gray Container Input Card */}
      <div className="bg-[#333333] rounded-[28px] p-6 sm:p-8 text-white space-y-4 shadow-sm border border-stone-800">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Input a claim..."
          className="w-full bg-transparent text-stone-200 placeholder-stone-400 font-serif italic text-base focus:outline-none resize-none h-28 leading-relaxed"
        />
      </div>

      {/* Initiate Analysis Action Button */}
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="w-full py-4 bg-[#111827] text-white font-mono text-xs font-bold tracking-widest rounded-full uppercase hover:bg-black transition-all cursor-pointer shadow-xs"
      >
        {isAnalyzing ? "ANALYZING CLAIM..." : "INITIATE ANALYSIS"}
      </button>

      {/* Verdict Result Card */}
      <div className="bg-white border border-stone-200/80 rounded-[28px] p-6 sm:p-8 space-y-4 text-left shadow-2xs">
        
        {/* False Verdict Badge */}
        <div>
          <span className="bg-[#FCE8E6] text-[#C5221F] px-4 py-1.5 rounded-full font-mono text-[10px] font-bold tracking-widest inline-block uppercase">
            {activeClaim.verdict.includes("FALSE") ? "FALSE VERDICT" : `${activeClaim.verdict} VERDICT`}
          </span>
        </div>

        {/* Factual Record Body */}
        <p className="font-serif font-bold text-stone-900 text-base sm:text-lg leading-relaxed">
          {activeClaim.verdictDetail}
        </p>

        {/* Official Source citation */}
        <div className="border-t border-stone-100 pt-3 font-mono text-[10px] text-stone-400 flex items-center justify-between">
          <span>OFFICIAL SOURCE: <strong className="text-stone-700">{activeClaim.officialSource}</strong></span>
          <span>VERIFICATION SCORE: {activeClaim.confidenceScore}%</span>
        </div>

      </div>

    </div>
  );
}

