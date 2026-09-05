import React from "react";
import { Link, useNavigate } from "react-router-dom";
import type { NewsStory } from "../../types";
import { decodeHtmlEntities, cleanDescriptionText } from "../../utils/decode";
import { ShareButton } from "../ShareButton";
import { BookmarkButton } from "../BookmarkButton";
import { TopicTag } from "../TopicTag";

interface StoryCardProps {
  story: NewsStory;
}

export function StoryCard({ story }: StoryCardProps) {
  const navigate = useNavigate();
  const sourcesCount = typeof story.sourceCount === 'number' && story.sourceCount > 0 ? story.sourceCount : (story.perspectives?.length || 1);

  const navigateToStory = () => {
    navigate(`/story/${story.id}`);
  };

  return (
    <article 
      onClick={navigateToStory}
      className="flex flex-col justify-between group cursor-pointer bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 overflow-hidden shadow-2xs hover:shadow-md"
    >
      <div className="flex flex-col">
        {/* Card Image or Editorial Slate */}
        {story.imageUrl ? (
          <div className="w-full aspect-[16/9] bg-gray-100 dark:bg-gray-900 overflow-hidden relative border-b border-gray-100 dark:border-gray-800">
            <img
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
              alt={story.title}
              src={story.imageUrl}
            />
          </div>
        ) : (
          <div className="w-full aspect-[16/9] bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200/60 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800 p-5 flex flex-col justify-between relative">
            <div className="flex items-center justify-between text-[10px] font-sans font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              <span>{story.category || "National"} Desk</span>
              <span className="material-symbols-outlined text-[15px] opacity-60">article</span>
            </div>
            <p className="font-serif italic text-[14px] text-gray-700 dark:text-gray-300 line-clamp-2 leading-snug">
              "{cleanDescriptionText(story.description || story.title).slice(0, 110)}..."
            </p>
            <span className="text-[10px] font-sans font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {story.primaryReportingOutlet || "National Wire"}
            </span>
          </div>
        )}

        {/* Content Container */}
        <div className="p-5 flex flex-col gap-2.5">
          {/* Eyebrow / Metadata */}
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
            <span className="text-rose-600 dark:text-rose-500 font-bold">
              {story.category || "Essential"}
            </span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-black dark:text-white font-bold truncate">
              {story.primaryReportingOutlet || "National Desk"}
            </span>
          </div>

          {/* Topic Tags */}
          {story.entities?.topics && story.entities.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {story.entities.topics.slice(0, 3).map((topic, index) => (
                <TopicTag key={`${story.id}-topic-${index}`} topic={topic} />
              ))}
            </div>
          )}

          {/* Editorial Serif Headline */}
          <h4 className="font-serif font-bold text-[20px] sm:text-[21px] text-black dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-[1.22] tracking-[-0.015em] line-clamp-3">
            {decodeHtmlEntities(story.title)}
          </h4>

          {/* Excerpt */}
          {story.description && (
            <p className="text-[13.5px] text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mt-0.5">
              {cleanDescriptionText(story.description)}
            </p>
          )}

          {/* Cross-Desk Intelligence & Framing Indicator */}
          {sourcesCount > 1 && (
            <div className="flex items-center gap-2 pt-2 text-[11px] font-sans text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800/60 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {sourcesCount} Desks Corroborated
              </span>
              {story.perspectives?.[0]?.framingLens && (
                <>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <span className="capitalize text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                    {story.perspectives[0].framingLens}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/30">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-sans font-medium text-gray-400 dark:text-gray-500">
            {new Date(story.timestamp || story.date || Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
          <div className="flex gap-2">
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
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 flex items-center gap-1 transition-colors">
          Briefing
          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
        </span>
      </div>
    </article>
  );
}
