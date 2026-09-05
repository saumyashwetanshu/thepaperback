import React from "react";
import { Link } from "react-router-dom";
import type { NewsStory } from "../../types";
import { decodeHtmlEntities } from "../../utils/decode";

interface CompactStoryListProps {
  stories: NewsStory[];
}

export function CompactStoryList({ stories }: CompactStoryListProps) {
  if (!stories || stories.length === 0) return null;

  return (
    <div className="md:col-span-2 flex flex-col divide-y divide-gray-100 dark:divide-gray-800/80 bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl overflow-hidden mt-2 shadow-2xs">
      {stories.map((story) => (
        <Link
          key={story.id}
          to={`/story/${story.id}`}
          className="p-4 sm:p-5 flex justify-between items-center group hover:bg-gray-50/70 dark:hover:bg-gray-900/50 transition-colors"
        >
          <div className="flex-grow pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest">
              <span className="text-rose-600 dark:text-rose-500 font-bold">
                {story.category || "Essential"}
              </span>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span className="text-black dark:text-white font-bold">
                {story.primaryReportingOutlet || "National Desk"}
              </span>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span className="text-gray-400 dark:text-gray-500 font-sans font-medium">
                {new Date(story.timestamp || story.date || Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
            <h5 className="font-serif font-bold text-[17px] sm:text-[18px] leading-snug text-black dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors tracking-tight">
              {decodeHtmlEntities(story.title)}
            </h5>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-rose-50 dark:group-hover:bg-rose-950/40 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-all shrink-0 ml-2">
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
