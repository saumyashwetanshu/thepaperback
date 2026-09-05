import React from "react";
import type { NewsStory } from "../../types";

export function UnclearContext({ story }: { story: NewsStory }) {
  let unclear: any[] = [];
  if (Array.isArray(story.outstandingUncertainty)) {
      unclear = story.outstandingUncertainty;
  } else if (typeof story.outstandingUncertainty === 'string') {
      unclear = [story.outstandingUncertainty];
  } else if (Array.isArray(story.contestedContext)) {
      unclear = story.contestedContext;
  } else if (typeof story.contestedContext === 'string') {
      unclear = [story.contestedContext];
  }
  
  if (unclear.length === 0) return null;

  return (
    <section className="flex flex-col gap-5 w-full mt-2">
      <header className="mb-2 border-b border-gray-200/90 dark:border-gray-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <h2 className="text-[22px] md:text-[26px] font-black tracking-tight text-black dark:text-white">
              Unverified & Conflicting Context
            </h2>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">
            Evidence gaps, contested claims, and points of divergence
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        {unclear.map((item, index) => (
          <div key={index} className="flex flex-col gap-2 bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-2xs hover:border-amber-300 dark:hover:border-amber-700/60 transition-colors">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 rounded-full font-sans text-[11px] font-bold">
                GAP {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            {typeof item === 'string' ? (
              <p className="text-[16px] md:text-[17px] font-normal text-black dark:text-white leading-relaxed">{item}</p>
            ) : (
              <>
                <p className="text-[16px] md:text-[17px] font-medium text-black dark:text-white leading-relaxed">{item.point}</p>
                {item.reason && (
                  <div className="border-l-2 border-amber-400 dark:border-amber-600 pl-3 mt-1">
                    <span className="block text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-0.5">Reason for Uncertainty</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.reason}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
