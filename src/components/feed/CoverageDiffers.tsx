import React from "react";
import type { NewsStory } from "../../types";
import { Link } from "react-router-dom";
import { decodeHtmlEntities, cleanDescriptionText } from "../../utils/decode";

export function CoverageDiffers({ stories }: { stories: NewsStory[] }) {
  if (!stories || stories.length === 0) return null;
  
  return (
    <section className="pt-8 border-t border-gray-200/90 dark:border-gray-800 mt-8">
      <div className="mb-6">
        <h3 className="text-[24px] md:text-[28px] font-black tracking-tight leading-snug text-black dark:text-white mb-1">
          Where Coverage Differs
        </h3>
        <p className="text-[15px] text-gray-600 dark:text-gray-400">Same event, different emphasis across newsrooms.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stories.slice(0, 2).map((story, i) => (
          <Link 
            key={story.id || i} 
            to={`/story/${story.id}`} 
            className="group flex flex-col justify-between p-6 bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 shadow-2xs hover:shadow-md"
          >
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-gray-600 dark:text-gray-400">{story.category || "National"}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:text-gray-700"></span>
                <span className="text-black dark:text-white font-bold">
                  Contrast
                </span>
              </div>
              <h4 className="text-[17px] font-black text-black dark:text-white leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors tracking-tight mt-1">
                {decodeHtmlEntities(story.title)}
              </h4>
              {story.description && (
                <p className="text-[14px] text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed mt-1">
                  {cleanDescriptionText(story.description)}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-3 mt-4 border-t border-gray-100 dark:border-gray-800 text-[11px]">
              <span className="text-gray-500 dark:text-gray-400 font-medium font-sans text-[11px]">
                {story.primaryReportingOutlet || "Multiple Desks"}
              </span>
              <span className="font-bold text-black dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1 uppercase text-[10px] tracking-widest transition-colors">
                Compare Angles
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
