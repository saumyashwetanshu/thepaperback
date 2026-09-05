import React from "react";
import type { NewsStory } from "../../types";
import { Link } from "react-router-dom";
import { decodeHtmlEntities } from "../../utils/decode";

export function WhatsEstablished({ stories }: { stories: NewsStory[] }) {
  if (!stories || stories.length === 0) return null;
  
  return (
    <section className="bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-5 shadow-2xs">
      <div className="pb-3.5 border-b border-gray-100 dark:border-gray-800 mb-2">
        <h3 className="text-[12px] font-bold text-black dark:text-white uppercase tracking-widest mb-0.5">Also Noted</h3>
        <p className="text-[12px] text-gray-500 dark:text-gray-400">Other stories worth a look.</p>
      </div>
      
      <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/80">
        {stories.slice(0, 3).map((story, i) => (
          <Link key={story.id || i} to={`/story/${story.id}`} className="group py-3 px-1.5 flex flex-col gap-1.5 hover:bg-gray-50/70 dark:hover:bg-gray-900/50 rounded-lg transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {story.primaryReportingOutlet || "National Desk"}
            </span>
            <h4 className="text-[14px] sm:text-[15px] font-bold text-black dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug tracking-tight">
              {decodeHtmlEntities(story.title)}
            </h4>
          </Link>
        ))}
      </div>
    </section>
  );
}
