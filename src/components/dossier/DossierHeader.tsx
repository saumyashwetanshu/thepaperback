import React from "react";
import type { NewsStory } from "../../types";
import { decodeHtmlEntities } from "../../utils/decode";

interface DossierHeaderProps {
  story: NewsStory;
}

export function DossierHeader({ story }: DossierHeaderProps) {
  // Format the date or timestamp
  const timeUpdated = story.timestamp 
    ? new Date(story.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : (story.date || "Recently Updated");

  return (
    <header className="space-y-4 border-b border-outline-variant pb-8">
      <div className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">
        Story Intelligence
      </div>
      <h1 className="font-display-lg text-display-lg text-on-background leading-tight">
        {decodeHtmlEntities(story.title)}
      </h1>
      <h2 className="font-headline-md text-headline-md text-on-surface-variant font-normal">
        {story.description}
      </h2>
      <div className="flex items-center space-x-4 pt-4 text-secondary">
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-[16px]" data-icon="apartment">
            apartment
          </span>
          <span className="font-data-mono text-data-mono">
            {story.institution || ""}
          </span>
        </div>
        <span>|</span>
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-[16px]" data-icon="schedule">
            schedule
          </span>
          <span className="font-data-mono text-data-mono">Updated: {timeUpdated}</span>
        </div>
      </div>
    </header>
  );
}
