import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NewsService } from "../services/news.service";

export function FactCheck() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVerdict, setSelectedVerdict] = useState("All");
  const [dynamicQuery, setDynamicQuery] = useState("");
  
  const queryClient = useQueryClient();

  const { data: feedData, isLoading: loading } = useQuery({
    queryKey: ['fact-checks'],
    queryFn: async () => {
      const res = await NewsService.getLiveFactChecks();
      return res.feed || [];
    }
  });

  const factCheckMutation = useMutation({
    mutationFn: (claim: string) => NewsService.postFactCheck(claim),
    onSuccess: (data) => {
      if (data.success && data.analysis) {
        // Prepend to the cache
        queryClient.setQueryData(['fact-checks'], (old: any) => {
          return [data.analysis, ...(old || [])];
        });
        setDynamicQuery("");
      }
    }
  });

  const handleDynamicSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dynamicQuery.trim()) return;
    factCheckMutation.mutate(dynamicQuery);
  };

  const getVerdictStyle = (classification: string) => {
    switch (classification) {
      case "VERIFIED": return { icon: "check_circle", colorClass: "text-emerald-600", badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-300", label: "VERIFIED" };
      case "FALSE": return { icon: "cancel", colorClass: "text-rose-600", badgeBg: "bg-rose-50 text-rose-800 border-rose-300", label: "FALSE / DISPROVEN" };
      case "PARTIALLY VERIFIED": return { icon: "info", colorClass: "text-sky-600", badgeBg: "bg-sky-50 text-sky-800 border-sky-300", label: "PARTIALLY VERIFIED" };
      case "NEEDS CONTEXT": return { icon: "warning", colorClass: "text-amber-600", badgeBg: "bg-amber-50 text-amber-800 border-amber-300", label: "NEEDS CONTEXT" };
      default: return { icon: "help", colorClass: "text-gray-600", badgeBg: "bg-gray-50 text-gray-800 border-gray-300", label: classification || "UNVERIFIED" };
    }
  };

  return (
    <main className="flex-grow w-full max-w-[1240px] mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col gap-12 bg-white dark:bg-black font-sans transition-colors">
      
      {/* Header Section */}
      <section className="pb-8 border-b border-gray-200/90 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-sm bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest leading-none">
            Forensic Desk
          </span>
          <span className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-sans">
            Forensic Fact Check
          </span>
        </div>
        <h1 className="text-[40px] md:text-[52px] font-black tracking-[-0.03em] leading-none text-black dark:text-white mb-3">
          Fact Check & Verification
        </h1>
        <p className="text-[17px] md:text-[18px] text-gray-600 dark:text-gray-400 max-w-2xl mb-8 leading-relaxed">
          Cross-examine claims, viral statements, and breaking rumors against live Indian newsrooms and automated forensic verification.
        </p>
        
        {/* Dynamic Search Box */}
        <div className="bg-gray-50 dark:bg-gray-900/90 p-6 rounded-2xl border border-gray-200/90 dark:border-gray-800 flex flex-col gap-3 shadow-2xs">
          <label className="text-[11px] font-bold text-black dark:text-white uppercase tracking-widest">Verify Any Claim or Headline</label>
          <form onSubmit={handleDynamicSearch} className="flex flex-col md:flex-row gap-3">
            <input 
              type="text" 
              className="flex-grow bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-black dark:focus:border-white focus:ring-0 px-4 py-3 text-base text-black dark:text-white placeholder:text-gray-400 transition-colors" 
              placeholder="e.g. 'Modi resigned' or 'Onion prices increased to Rs 62'..." 
              value={dynamicQuery}
              onChange={(e) => setDynamicQuery(e.target.value)}
              disabled={factCheckMutation.isPending}
            />
            <button 
              type="submit" 
              disabled={factCheckMutation.isPending || !dynamicQuery.trim()}
              className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[12px] font-bold uppercase tracking-widest hover:opacity-85 disabled:opacity-50 transition-all whitespace-nowrap flex items-center justify-center gap-2"
            >
              {factCheckMutation.isPending ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying across Desks…</span>
                </>
              ) : "Fact Check Claim"}
            </button>
          </form>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-col md:flex-row gap-6 items-end pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex-grow w-full md:w-auto">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-2 uppercase tracking-widest">Search Verified Archive</label>
          <input 
            type="text" 
            className="w-full bg-transparent border-0 border-b border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-0 px-0 py-2 text-base text-black dark:text-white placeholder:text-gray-400 transition-colors outline-none" 
            placeholder="Filter by keyword or topic..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-2 uppercase tracking-widest">Filter by Verdict</label>
          <select 
            className="w-full bg-transparent border-0 border-b border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-0 px-0 py-2 text-base text-black dark:text-white transition-colors outline-none cursor-pointer font-medium"
            value={selectedVerdict}
            onChange={(e) => setSelectedVerdict(e.target.value)}
          >
            <option value="All">All Verdicts</option>
            <option value="VERIFIED">Verified</option>
            <option value="FALSE">False / Disproven</option>
            <option value="PARTIALLY VERIFIED">Partially Verified</option>
            <option value="NEEDS CONTEXT">Needs Context</option>
          </select>
        </div>
      </section>

      {/* Claims Feed */}
      <section className="flex flex-col gap-8">
        {loading ? (
          <div className="text-center text-[20px] font-bold text-gray-400 py-12">Loading fact-check archive…</div>
        ) : !feedData || feedData.length === 0 ? (
          <div className="text-center text-base text-gray-500 py-12">No recent claims verified yet. Enter a claim above to verify!</div>
        ) : (
          feedData.filter((fc: any) => {
            if (selectedVerdict !== "All" && fc.verdict !== selectedVerdict) return false;
            if (searchQuery) {
              const q = searchQuery.toLowerCase();
              if (!fc.claim?.toLowerCase().includes(q) && 
                  !fc.verdictDetail?.toLowerCase().includes(q) && 
                  !fc.primaryReportingOutlet?.toLowerCase().includes(q)) {
                return false;
              }
            }
            return true;
          }).map((fc: any, idx: number) => {
            const style = getVerdictStyle(fc.verdict);
            
            return (
              <article key={`${fc.id || Date.now()}-${idx}`} className="flex flex-col border border-gray-200/90 dark:border-gray-800 rounded-2xl p-6 md:p-8 bg-white dark:bg-gray-950 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{fc.primaryReportingOutlet || "AI Forensic Analysis"}</span>
                    <span className="text-gray-300 dark:text-gray-700">&bull;</span>
                    <span className="font-sans font-medium text-[12px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{fc.timestamp ? new Date(fc.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just Now'}</span>
                  </div>
                  {typeof fc.confidenceScore === 'number' && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Confidence</span>
                      <span className="text-[12px] font-sans font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full">{fc.confidenceScore}%</span>
                    </div>
                  )}
                </div>
                
                <h2 className="text-[24px] md:text-[28px] font-black tracking-tight leading-snug text-black dark:text-white mb-6">
                  "{fc.claim}"
                </h2>
                
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-5/12 flex-shrink-0 flex flex-col gap-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-full w-fit font-bold text-[12px] tracking-wider uppercase ${style.badgeBg}`}>
                      <span className={`material-symbols-outlined text-[17px] ${style.colorClass}`} style={{ fontVariationSettings: "'FILL' 1" }}>{style.icon}</span>
                      <span>{style.label}</span>
                    </div>
                    <p className="text-[16px] text-gray-800 dark:text-gray-200 leading-relaxed font-normal mt-1">
                      {fc.verdictDetail}
                    </p>
                  </div>
                  
                  <div className="md:w-7/12 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 pt-6 md:pt-0 md:pl-8 flex flex-col gap-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      Context & Evidence
                    </h3>
                    
                    {fc.divergence && (
                      <p className="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/60 p-3.5 rounded-xl border-l-2 border-amber-500">
                        {fc.divergence}
                      </p>
                    )}
                    
                    {fc.evidenceTrail && (
                      <div className="text-[14px] text-gray-800 dark:text-gray-200">
                        <span className="font-bold text-black dark:text-white block text-[11px] uppercase tracking-wider mb-1">Evidence Trail:</span>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{fc.evidenceTrail}</p>
                      </div>
                    )}

                    {((fc.corroboratingSources && fc.corroboratingSources.length > 0) || fc.primaryReportingOutlet) && (
                      <div className="text-[13px] text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2 items-center">
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wider">Cross-Referenced Outlets:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[fc.primaryReportingOutlet, ...(fc.corroboratingSources || [])].filter(s => s && s !== "Consensus Fact Check" && s !== "Forensic Analysis").map((source, i) => (
                            <span key={i} className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-[11px] font-semibold border border-gray-200/60 dark:border-gray-700">{source}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}

