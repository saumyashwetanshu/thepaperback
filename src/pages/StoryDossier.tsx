import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { recordStoryRead } from "../utils/readingLedger";
import { recordHistoryToFirestore } from "../services/firebase";
import { NewsService } from "../services/news.service";
import { EditorialLead } from "../components/dossier/EditorialLead";
import { WhatHappened } from "../components/dossier/WhatHappened";
import { VerifiableConsensus } from "../components/dossier/VerifiableConsensus";
import { UnclearContext } from "../components/dossier/UnclearContext";
import { NarrativeLandscape } from "../components/dossier/NarrativeLandscape";
import { InteractiveTimeline } from "../components/dossier/InteractiveTimeline";
import { CoverageComparisonMatrix } from "../components/dossier/CoverageComparisonMatrix";
import { ReadingProgress } from "../components/ReadingProgress";
import { TopicTag } from "../components/TopicTag";
import { ShareButton } from "../components/ShareButton";
import { BookmarkButton } from "../components/BookmarkButton";
import { Breadcrumb } from "../components/Breadcrumb";
import { DossierChat } from "../components/dossier/DossierChat";
import { useLanguage } from "../context/LanguageContext";
import { getContextualStory } from "../data/newsTranslator";
import type { NewsStory } from "../types";

export function StoryDossier() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { data: rawStory, isLoading: loading, error } = useQuery({
    queryKey: ['story', id],
    queryFn: () => NewsService.getStoryById(id as string),
    enabled: !!id,
  });

  const story = rawStory ? getContextualStory(rawStory, language) : undefined;

  useEffect(() => {
    if (story) {
      recordStoryRead(story);
      if (user) {
        recordHistoryToFirestore(user.uid, story);
      }
    }
  }, [story, user]);

  if (loading) {
    return (
      <main className="flex-grow w-full max-w-[1100px] mx-auto px-4 md:px-8 py-12 flex flex-col gap-12">
        <div className="animate-pulse flex flex-col gap-8">
          <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 tracking-wide">
            Reading full articles...
          </p>
          {/* Editorial Lead Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="h-6 bg-gray-200 w-32 rounded"></div>
            <div className="h-16 bg-gray-200 w-3/4 rounded"></div>
            <div className="h-24 bg-gray-200 w-full rounded"></div>
          </div>

          {/* What Happened Skeleton */}
          <div className="border-t border-gray-200 pt-8 flex flex-col gap-4">
            <div className="h-8 bg-gray-200 w-48 rounded"></div>
            <div className="h-32 bg-gray-200 w-full rounded"></div>
          </div>

          {/* Consensus Skeleton */}
          <div className="border-t border-gray-200 pt-8 flex flex-col gap-4">
            <div className="h-8 bg-gray-200 w-48 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-20 bg-gray-200 w-full rounded"></div>
              <div className="h-20 bg-gray-200 w-full rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !story) {
    return (
      <div className="flex-grow w-full max-w-[1440px] mx-auto px-margin-desktop py-editorial-stack flex flex-col items-center justify-center gap-4">
        <div className="font-display-sm text-display-sm text-error">Dossier Unavailable</div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {error instanceof Error ? error.message : "Story not found"}
        </p>
        <Link
          to="/"
          className="px-6 py-2 bg-primary text-on-primary font-label-caps uppercase hover:opacity-90 transition-opacity"
        >
          Return to Feed
        </Link>
      </div>
    );
  }

  return (
    <main className="flex-grow w-full max-w-[1100px] mx-auto px-4 md:px-8 py-10 md:py-16 flex flex-col gap-12 md:gap-16">
      <ReadingProgress className="mb-4" />
      {!loading && !error && story && (
        <Breadcrumb story={{
          id: story.id,
          title: story.title,
          category: story.category || 'National'
        }} />
      )}
      <EditorialLead story={story} />

      {/* Sticky Executive Jump Bar */}
      <nav aria-label="Dossier sections" className="sticky top-16 z-30 -mx-4 px-4 md:-mx-8 md:px-8 py-2.5 bg-white/90 dark:bg-black/90 backdrop-blur-md border-y border-gray-200/80 dark:border-gray-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-sans uppercase tracking-widest text-gray-400 font-bold shrink-0 mr-1">
          Dossier Index:
        </span>
        <a href="#overview" className="px-3 py-1 rounded-full text-xs font-sans font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 transition-colors">
          Overview
        </a>
        <a href="#consensus" className="px-3 py-1 rounded-full text-xs font-sans font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 transition-colors">
          Corroborated Facts
        </a>
        <a href="#framing" className="px-3 py-1 rounded-full text-xs font-sans font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 transition-colors">
          Framing Divergence
        </a>
        <a href="#matrix" className="px-3 py-1 rounded-full text-xs font-sans font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 transition-colors">
          Desk Matrix
        </a>
        <a href="#dossier-chat-section" className="px-3 py-1 rounded-full text-xs font-sans font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 shrink-0 transition-colors flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
          Story Q&A
        </a>
        {story.timeline && story.timeline.length > 0 && (
          <a href="#timeline" className="px-3 py-1 rounded-full text-xs font-sans font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 transition-colors">
            Timeline
          </a>
        )}
      </nav>

      <div className="flex flex-col gap-12 md:gap-16 pt-6">
        <WhatHappened story={story} />
        <VerifiableConsensus story={story} />
        <UnclearContext story={story} />
        <NarrativeLandscape story={story} />
        <CoverageComparisonMatrix story={story} />
        <DossierChat story={story} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-12 md:pt-16 mb-16">
        <InteractiveTimeline story={story} />
      </div>
    </main>
  );
}
