import React from "react";
import type { NewsStory } from "../../types";
import { Link } from "react-router-dom";
import { decodeHtmlEntities, cleanDescriptionText } from "../../utils/decode";

export function VoicesOfIndiaFeed({ stories }: { stories: NewsStory[] }) {
  if (!stories || stories.length === 0) return null;
  
  return (
    <section className="pt-8 border-t border-gray-200/90 dark:border-gray-800 mt-8 mb-12">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h3 className="text-[24px] md:text-[28px] font-black tracking-tight leading-snug text-black dark:text-white mb-1">
            Voices of India
          </h3>
          <p className="text-[15px] text-gray-600 dark:text-gray-400">Reporting from states and regions beyond the national desk.</p>
        </div>
        <Link to="/voices" className="text-[11px] font-bold text-black dark:text-white uppercase tracking-widest hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors">
          See all
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stories.slice(0, 3).map((story, i) => (
          <Link 
            key={story.id || i} 
            to={`/story/${story.id}`} 
            className="group flex flex-col justify-between p-5 bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 shadow-2xs hover:shadow-md"
          >
            <div className="flex flex-col gap-2.5">
              {story.imageUrl ? (
                <div className="aspect-[16/10] bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                  <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-all duration-500" />
                </div>
              ) : (
                <div className="aspect-[16/10] bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Regional Desk</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-snug line-clamp-2">{decodeHtmlEntities(story.title)}</span>
                </div>
              )}
              <div className="flex gap-2 items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-blue-700 dark:text-blue-400 font-bold">
                  {story.region ? `REPORTED FROM ${story.region}` : "REGIONAL PERSPECTIVE"}
                </span>
              </div>
              <h4 className="text-[16px] font-black text-black dark:text-white leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors tracking-tight">
                {decodeHtmlEntities(story.title)}
              </h4>
              {story.description && (
                <p className="text-[14px] text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">{cleanDescriptionText(story.description)}</p>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-sans font-medium text-gray-500 dark:text-gray-400">{story.primaryReportingOutlet || "Regional Desk"}</span>
              <span className="text-black dark:text-white font-bold group-hover:text-rose-600 dark:group-hover:text-rose-400">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
