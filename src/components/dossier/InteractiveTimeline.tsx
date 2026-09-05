import React from 'react';
import type { NewsStory, TimelineEvent } from '../../types';

export function InteractiveTimeline({ story }: { story: NewsStory }) {
  if (!story.timeline || story.timeline.length === 0) return null;

  // Deduplicate timeline events by combining title and description
  const seenEvents = new Set<string>();
  const uniqueTimeline = story.timeline.filter(event => {
    const key = `${event.date}-${event.title}-${event.description}`.toLowerCase();
    if (seenEvents.has(key)) return false;
    seenEvents.add(key);
    return true;
  });

  if (uniqueTimeline.length === 0) return null;

  return (
    <section id="timeline" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 mb-2 border-b border-gray-100 dark:border-gray-800 pb-3">
        <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-gray-400">
          Chronology
        </span>
        <h3 className="text-[22px] md:text-[26px] font-black text-black dark:text-white tracking-tight flex items-center gap-2">
          Timeline of Events
        </h3>
        <p className="text-[13px] text-gray-500 dark:text-gray-400">Chronological developments drawn from indexed multi-desk reporting.</p>
      </div>
      
      <div className="flex flex-col relative before:absolute before:inset-0 before:ml-[9px] before:w-[2px] before:bg-gray-200 dark:before:bg-gray-800 pb-4">
        {uniqueTimeline.map((event: TimelineEvent, idx: number) => {
          return (
            <div key={idx} className="relative flex items-start gap-6 mb-8 last:mb-0">
              <div className="flex items-center justify-center w-[20px] h-[20px] rounded-full bg-white dark:bg-gray-950 border-4 border-gray-300 dark:border-gray-700 shrink-0 z-10 mt-1"></div>
              
              <div className="flex flex-col gap-1 w-full bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-2xs">
                <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">{event.date}</span>
                <h4 className="font-serif font-bold text-[18px] text-black dark:text-white leading-snug">{event.title}</h4>
                <p className="text-[14.5px] text-gray-700 dark:text-gray-300 leading-relaxed mt-1">
                  {event.description}
                </p>
                {event.sourceUrl && (
                  <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-[11px] font-sans font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:underline mt-2 w-max">
                    Source Link <span className="material-symbols-outlined text-[13px] ml-1">arrow_forward</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
