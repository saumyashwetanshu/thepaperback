import React from "react";
import { Link } from "react-router-dom";
import type { NewsStory } from "../../types";
import { decodeHtmlEntities, cleanDescriptionText } from "../../utils/decode";
import { ShareButton } from "../ShareButton";
import { BookmarkButton } from "../BookmarkButton";

interface HeroStoryProps {
  story: NewsStory;
}

export function HeroStory({ story }: HeroStoryProps) {
  const sourcesCount = typeof story.sourceCount === 'number' && story.sourceCount > 0 ? story.sourceCount : (story.perspectives?.length || 1);

  return (
    <article className="group cursor-pointer bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-7 md:p-10 mb-10 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 shadow-sm hover:shadow-lg">
      <Link to={`/story/${story.id}`} className="flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* Left: Content Column */}
        <div className="flex flex-col justify-between flex-1 order-2 lg:order-1">
          <div className="flex flex-col gap-3">
            {/* Apple News Metadata Eyebrow */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
              <span className="text-rose-600 dark:text-rose-500 font-bold">
                {story.category || "Top Story"}
              </span>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span className="text-black dark:text-white font-bold">
                {story.primaryReportingOutlet || "National Desk"}
              </span>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span className="text-gray-500 dark:text-gray-400 font-sans font-medium">
                {new Date(story.timestamp || story.date || Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>

            {/* Editorial Serif Headline */}
            <h2 className="font-serif font-bold text-[32px] md:text-[42px] lg:text-[48px] text-black dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-[1.08] tracking-[-0.025em] mt-1">
              {decodeHtmlEntities(story.title)}
            </h2>

            {/* Summary Deck */}
            {story.description && (
              <p className="text-[16px] md:text-[18px] text-gray-700 dark:text-gray-300 leading-relaxed font-normal mt-2 line-clamp-3 md:line-clamp-4">
                {cleanDescriptionText(story.description)}
              </p>
            )}

            {(story.perspectives?.length || sourcesCount > 1) && (
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-sans font-medium tracking-wider text-gray-500 dark:text-gray-400 mt-3 pt-2">
                <span className="text-black dark:text-white font-bold uppercase">
                  {sourcesCount} {sourcesCount === 1 ? "Desk" : "Desks"} Cross-Examined:
                </span>
                <span>
                  {story.perspectives?.length ? story.perspectives.slice(0, 4).map(p => p.source).filter(Boolean).join(" • ") : story.primaryReportingOutlet || "National Wire"}
                </span>
              </div>
            )}
          </div>
          
          {/* Bottom Timestamp & Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/80">
            <div className="flex items-center gap-2">
              <BookmarkButton story={story} size="sm" />
              <ShareButton
                story={{
                  id: story.id,
                  title: story.title,
                  url: `/story/${story.id}`
                }}
                size="sm"
              />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 flex items-center gap-1 transition-colors">
              Open Story Dossier
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </span>
          </div>
        </div>

        {/* Right: Feature Image or Editorial Slate */}
        {story.imageUrl ? (
          <div className="w-full lg:w-[46%] aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto overflow-hidden bg-gray-100 dark:bg-gray-900 order-1 lg:order-2 rounded-xl border border-gray-200/80 dark:border-gray-800 relative">
            <img
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              src={story.imageUrl}
            />
          </div>
        ) : (
          <div className="w-full lg:w-[46%] aspect-[16/10] bg-gradient-to-br from-gray-900 to-black dark:from-gray-950 dark:to-gray-900 p-7 flex flex-col justify-between order-1 lg:order-2 rounded-xl border border-gray-800 text-white shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-rose-400">
                {story.category || "National"} • Editorial Brief
              </span>
              <span className="material-symbols-outlined text-gray-500 text-[18px]">format_quote</span>
            </div>
            <p className="font-serif italic text-[17px] md:text-[19px] leading-relaxed text-gray-200 line-clamp-4">
              "{story.description ? cleanDescriptionText(story.description).slice(0, 180) + "..." : cleanDescriptionText(story.title)}"
            </p>
            <div className="flex items-center justify-between text-[11px] font-sans text-gray-400 pt-3 border-t border-gray-800">
              <span className="uppercase tracking-wider text-gray-300">
                {story.primaryReportingOutlet || "National Desk"}
              </span>
              <span>{sourcesCount} Outlets Corroborated</span>
            </div>
          </div>
        )}
      </Link>
    </article>
  );
}
