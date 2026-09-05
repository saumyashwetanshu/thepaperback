import React from "react";
import type { NewsStory } from "../../types";

export function VerifiableConsensus({ story }: { story: NewsStory }) {
  let facts: string[] = [];
  
  const rawFacts = story.sharedFactualGround || story.verifiableConsensus;
  
  if (Array.isArray(rawFacts)) {
      facts = rawFacts;
  } else if (typeof rawFacts === 'string') {
      try {
          const parsed = JSON.parse(rawFacts);
          if (Array.isArray(parsed)) facts = parsed;
          else facts = [rawFacts];
      } catch {
          // It might be a newline separated list or a single string
          facts = rawFacts.split('\n').filter(s => s.trim().length > 0);
      }
  }

  const claims = story.consensusClaims || [];
  
  if (facts.length === 0 && claims.length === 0) return null;

  const isHeadlineWordsOnly = facts.length > 0 && facts.every(f => 
    f.toLowerCase().startsWith("words in common:") || 
    f.toLowerCase().startsWith("words that appeared in several articles:") ||
    f.toLowerCase().startsWith("corroborated facts:")
  );

  const tokens = isHeadlineWordsOnly
    ? Array.from(new Set(facts.flatMap(f => 
        f.replace(/^(?:words in common|words that appeared in several articles|corroborated facts):\s*/i, '')
         .replace(/\.$/, '')
         .split(/,\s*/)
         .map(t => t.trim())
         .filter(t => t.length > 1)
      )))
    : [];

  return (
    <section id="consensus" className="flex flex-col gap-5 w-full">
      <header className="mb-2 border-b border-gray-200/90 dark:border-gray-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${isHeadlineWordsOnly ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
            <h2 className="text-[22px] md:text-[26px] font-black tracking-tight text-black dark:text-white">
              {isHeadlineWordsOnly ? "Words that appeared…" : "What the articles agree on"}
            </h2>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">
            {isHeadlineWordsOnly 
              ? "Words that appeared across headlines — not independently verified facts" 
              : "Points of agreement drawn from full-article reporting across newsrooms"}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        {isHeadlineWordsOnly && tokens.length > 0 ? (
          <div className="bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Cross-Desk Intersecting Vocabulary ({tokens.length} Shared Terms)
            </div>
            <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
              Words that appeared in several articles across {story.sourceCount || 'indexed'} desks (vocabulary overlap only — not a verification claim):
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {tokens.map((tok, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 text-black dark:text-white rounded-lg text-xs font-sans font-semibold tracking-tight capitalize shadow-2xs"
                >
                  {tok}
                </span>
              ))}
            </div>
          </div>
        ) : (
          facts.map((fact, index) => (
            <div key={`fact-${index}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-2xs hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
              <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 rounded-full font-sans text-[11px] font-bold">
                FACT {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-[16px] md:text-[17px] font-normal text-black dark:text-white leading-relaxed flex-1">
                {fact}
              </p>
            </div>
          ))
        )}

        {claims.map((claim, index) => (
          <div key={`claim-${index}`} className="flex flex-col gap-3 bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 rounded-full font-sans text-[11px] font-bold">
                CLAIM {String(facts.length + index + 1).padStart(2, '0')}
              </span>
            </div>
            <p className="text-[16px] md:text-[17px] font-medium text-black dark:text-white leading-relaxed">
              {claim.claim}
            </p>
            {claim.supportingOutlets && claim.supportingOutlets.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Reported by:</span>
                {claim.supportingOutlets.map((source: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 rounded-md">
                    {source}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
