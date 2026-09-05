import React from "react";
import type { NewsStory } from "../../types";
import { decodeHtmlEntities } from "../../utils/decode";
import { BookmarkButton } from "../BookmarkButton";
import { ShareButton } from "../ShareButton";

export function EditorialLead({ story }: { story: NewsStory }) {
  const timeUpdated = story.timestamp
    ? new Date(story.timestamp).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : (story.date || "Recently Updated");

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-rose-600 dark:text-rose-500 font-bold">
            {story.category || "National"}
          </span>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span className="font-sans font-medium tracking-tight">Updated {timeUpdated}</span>
          {typeof story.sourceCount === "number" && story.sourceCount > 0 ? (
            <>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span className="font-sans font-medium">{story.sourceCount} Desks Indexed</span>
            </>
          ) : null}
        </div>

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
      </div>

      <h1 className="font-serif font-bold text-[32px] sm:text-[42px] md:text-[48px] lg:text-[52px] text-black dark:text-white leading-[1.08] tracking-[-0.025em]">
        {decodeHtmlEntities(story.title)}
      </h1>

      {story.primaryReportingOutlet ? (
        <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-400 font-medium">
          <span className="font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            Primary Desk
          </span>
          <span>{story.primaryReportingOutlet}</span>
        </div>
      ) : null}
    </header>
  );
}
