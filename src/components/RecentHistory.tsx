import React from "react";
import { Link } from "react-router-dom";
import { getRecentStories } from "../utils/readingLedger";
import type { NewsStory } from "../types";

interface RecentHistoryProps {
  className?: string;
}

export function RecentHistory({ className = "" }: RecentHistoryProps) {
  const recentStories = getRecentStories(5); // Get 5 most recent stories

  if (recentStories.length === 0) {
    return null;
  }

  return (
    <section className={`bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-5 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800 mb-2">
        <h3 className="text-[12px] font-bold text-black dark:text-white uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-[15px] text-gray-400">history</span>
          Recently Read
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-sans">
          {recentStories.length} {recentStories.length === 1 ? "story" : "stories"}
        </span>
      </div>
      <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/80">
        {recentStories.map((entry) => (
          <Link
            key={entry.storyId}
            to={`/story/${entry.storyId}`}
            className="py-3 px-1.5 flex items-start gap-3 hover:bg-gray-50/70 dark:hover:bg-gray-900/50 rounded-lg transition-colors group cursor-pointer"
          >
            <div className="w-7 h-7 shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-[11px] font-bold text-gray-600 dark:text-gray-300 mt-0.5">
              {entry.category?.charAt(0) || "N"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-1">
                <span className="text-black dark:text-white font-bold truncate">
                  {entry.source || "Unknown"}
                </span>
                {entry.category && (
                  <>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span className="text-gray-400 dark:text-gray-500 truncate">{entry.category}</span>
                  </>
                )}
              </div>
              <h4 className="text-[13.5px] font-normal text-gray-800 dark:text-gray-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug line-clamp-2">
                {entry.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}