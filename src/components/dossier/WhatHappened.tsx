import React from "react";
import type { NewsStory } from "../../types";
import { ShareButton } from "../ShareButton";
import { BookmarkButton } from "../BookmarkButton";
import { TopicTag } from "../TopicTag";
import { HighlightNote } from "../HighlightNote";

export function WhatHappened({ story }: { story: NewsStory }) {
  const summary = story.summary || story.description;
  const storyUrl = story.sourceUrl || window.location.href;

  return (
    <section id="overview" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 border-b border-gray-100 dark:border-gray-800 pb-3">
        <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-gray-400">
          Executive Briefing
        </span>
        <h2 className="text-[24px] md:text-[28px] font-black text-black dark:text-white tracking-tight">
          What Happened
        </h2>
      </div>

      {/* Topic Tags */}
      {story.entities?.topics && story.entities.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {story.entities.topics.map((topic) => (
            <TopicTag key={topic} topic={topic} />
          ))}
        </div>
      )}

      {/* Summary with integrated highlighting */}
      {summary && summary.trim() !== '' && (
        <HighlightNote story={story} text={summary} />
      )}
    </section>
  );
}
