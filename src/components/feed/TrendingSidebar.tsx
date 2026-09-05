import React from "react";
import type { NewsStory } from "../../types";
import { Link } from "react-router-dom";
import { decodeHtmlEntities } from "../../utils/decode";
import { getTrendingTopicsForDisplay } from "../../utils/trendingTopics";

interface TrendingSidebarProps {
  stories: NewsStory[];
}

export function TrendingSidebar({ stories }: TrendingSidebarProps) {
  if (!stories || stories.length === 0) return null;

  const trendingTopics = getTrendingTopicsForDisplay(stories, {
    timeWindowHours: 24,
    maxTopics: 8,
    minFrequency: 1
  });

  if (trendingTopics.length === 0) return null;

  return (
    <aside className="flex flex-col gap-6">
      <div className="flex flex-col bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-5 shadow-2xs">
        {/* Module Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <h3 className="text-[12px] font-bold text-black dark:text-white uppercase tracking-widest">
              Trending Topics
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans">
            Last 24h
          </span>
        </div>

        {/* Trending Topics List */}
        <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/80">
          {trendingTopics.map((topic) => (
            <Link
              key={topic.topic}
              to={`/search?q=${encodeURIComponent(topic.topic)}`}
              className="flex items-center justify-between py-2.5 px-1.5 rounded-lg transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-900/50 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-sans text-xs font-semibold text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
                  {String(topic.rank).padStart(2, "0")}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                    {topic.label}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-sans text-gray-400 dark:text-gray-500">
                    <span>{topic.storyCount} stories</span>
                    {topic.recentBoost > 0 && (
                      <>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          +{Math.round(topic.recentBoost * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-[16px] text-gray-300 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2">
                chevron_right
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
