import React from "react";
import type { NewsStory } from "../../types";

export function NarrativeLandscape({ story }: { story: NewsStory }) {
  if (!story.narrativeLandscape && !story.narrativeDetails) return null;

  const hasDetails = !!story.narrativeDetails && !!(
    story.narrativeDetails.mainstreamVsIndependent ||
    story.narrativeDetails.regionalVsNational ||
    story.narrativeDetails.keyOmissions
  );

  const headlineComparisons = story.narrativeLandscape && story.narrativeLandscape.includes(" vs ")
    ? story.narrativeLandscape.split(/\s+vs\s+/i).map(h => h.replace(/^["']|["']$/g, '').trim()).filter(Boolean)
    : null;

  return (
    <section id="framing" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 mb-2 border-b border-gray-200/90 dark:border-gray-800 pb-3">
        <h3 className="text-[22px] md:text-[26px] font-black text-black dark:text-white tracking-tight flex items-center gap-2">
          How Coverage Differs
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Editorial Framing & Narrative Nuances</p>
      </div>

      <div className="text-[16px] md:text-[17px] text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
        {headlineComparisons && headlineComparisons.length > 1 ? (
          <div className="flex flex-col gap-3 mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 font-sans">
              Side-by-Side Headline Divergence ({headlineComparisons.length} Desks)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {headlineComparisons.map((headline, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800 text-[14px] md:text-[15px] font-medium text-black dark:text-white leading-snug">
                  <span className="block text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Angle 0{idx + 1}
                  </span>
                  "{headline}"
                </div>
              ))}
            </div>
          </div>
        ) : (
          story.narrativeLandscape && (
            <p className="mb-6">{story.narrativeLandscape}</p>
          )
        )}
        
        {hasDetails && (
          <div className="flex flex-col gap-4 mt-4 bg-gray-50 dark:bg-gray-900/90 p-6 rounded-2xl border border-gray-200/90 dark:border-gray-800">
            {story.narrativeDetails?.mainstreamVsIndependent && (
              <div>
                <strong className="block mb-1 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Mainstream vs. Independent</strong> 
                <span className="text-black dark:text-white">{story.narrativeDetails.mainstreamVsIndependent}</span>
              </div>
            )}
            {story.narrativeDetails?.regionalVsNational && (
              <div>
                <strong className="block mb-1 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Regional vs. National</strong> 
                <span className="text-black dark:text-white">{story.narrativeDetails.regionalVsNational}</span>
              </div>
            )}
            {story.narrativeDetails?.keyOmissions && (
              <div>
                <strong className="block mb-1 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Key Focus & Context</strong> 
                <span className="text-black dark:text-white">{story.narrativeDetails.keyOmissions}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
