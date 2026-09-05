import React from "react";
import { useQuery } from "@tanstack/react-query";
import { NewsService } from "../services/news.service";
import type { NavTabId } from "../App";
import { HeroStory } from "../components/feed/HeroStory";
import { StoryCard } from "../components/feed/StoryCard";
import { CompactStoryList } from "../components/feed/CompactStoryList";
import { HomeSkeleton } from "../components/feed/HomeSkeleton";
import { TrendingSidebar } from "../components/feed/TrendingSidebar";
import { LiveWireStream } from "../components/feed/LiveWireStream";
import { CoverageDiffers } from "../components/feed/CoverageDiffers";
import { WhatsEstablished } from "../components/feed/WhatsEstablished";
import { VoicesOfIndiaFeed } from "../components/feed/VoicesOfIndiaFeed";
import { RecentHistory } from "../components/RecentHistory";

export function Home({ activeTab }: { activeTab: NavTabId }) {
  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['news', 'feed'],
    queryFn: () => NewsService.getStories(1, 20),
    enabled: true,
  });

  React.useEffect(() => {
    const handleNewsUpdate = () => {
      refetch();
    };
    window.addEventListener("news_updated", handleNewsUpdate);
    return () => window.removeEventListener("news_updated", handleNewsUpdate);
  }, [refetch]);

  if (loading) {
    return <HomeSkeleton />;
  }

  const hasHomeRails = !!(
    data?.leadStory ||
    (data?.todaysEssentials && data.todaysEssentials.length > 0) ||
    (data?.trendingRail && data.trendingRail.length > 0) ||
    (data?.otherDevelopments && data.otherDevelopments.length > 0) ||
    (data?.wire && data.wire.length > 0)
  );

  if (error || !data || !hasHomeRails) {
    return (
      <div className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-10 py-16 md:py-24 flex flex-col items-center justify-center gap-5">
        <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest border border-rose-200/60 dark:border-rose-800/50">
          Edition building
        </span>
        <div className="text-[28px] md:text-[36px] font-black tracking-[-0.03em] text-black dark:text-white text-center">
          Preparing today's briefing
        </div>
        <p className="text-[15px] md:text-[16px] text-gray-600 dark:text-gray-400 max-w-lg text-center leading-relaxed">
          Stories are being clustered across Indian newsrooms. Live Wire may already have items — refresh in a moment for the full Home edition.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-[12px] font-bold uppercase tracking-widest rounded-full hover:opacity-85 transition-opacity"
        >
          Refresh edition
        </button>
      </div>
    );
  }

  // Search mode only when API returned a query string (never treat empty stories[] as search)
  const isSearch = typeof (data as any).query === "string" && !!(data as any).query;

  let heroStory: any, essentialStories: any[], compactStories: any[], trendingStories: any[], wireStories: any[], coverageDiffers: any[], established: any[], voices: any[];

  if (isSearch) {
    const stories = data.stories || [];
    heroStory = stories[0];
    essentialStories = stories.slice(1, 3);
    compactStories = stories.slice(3, 5);
    trendingStories = stories.slice(5, 9);
    wireStories = data.wire || [];
    coverageDiffers = stories.filter((s: any) => s.narrativeLandscape).slice(0, 2);
    if (coverageDiffers.length === 0) coverageDiffers = stories.slice(4, 6);
    established = stories.filter((s: any) => s.verifiableConsensus).slice(0, 3);
    if (established.length === 0) established = stories.slice(6, 9);
    voices = stories.slice(2, 5);
  } else {
    heroStory = data.leadStory;
    essentialStories = (data.todaysEssentials || []).slice(0, 2);
    compactStories = (data.todaysEssentials || []).slice(2, 4);
    trendingStories = (data.trendingRail || []).slice(0, 4);
    wireStories = data.wire || [];
    coverageDiffers = (data.coverageDiffers || []).slice(0, 2);
    established = (data.otherDevelopments || []).slice(0, 3);
    voices = (data.voicesOfIndia || []).slice(0, 3);

    if (!heroStory && essentialStories.length > 0) {
      heroStory = essentialStories.shift();
    }
  }

  return (
    <main className="flex-grow w-full max-w-[1340px] mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col font-sans bg-white dark:bg-black transition-colors">

      <section className="pb-8 border-b border-gray-200/90 dark:border-gray-800 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-sm bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest leading-none">
            Front Page
          </span>
          <span className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-sans">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>

        <h1 className="text-[40px] md:text-[54px] lg:text-[60px] font-black tracking-[-0.04em] leading-[1.05] text-black dark:text-white mb-3">
          Today's Edition
        </h1>
        <p className="text-[17px] md:text-[19px] text-gray-600 dark:text-gray-400 max-w-3xl leading-snug font-normal">
          One lead story, the essentials, and clear sections for contrast, regions, and the wire.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col">
          {heroStory && <HeroStory story={heroStory} />}

          <section className="pt-8 border-t border-gray-200/90 dark:border-gray-800 mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[26px] md:text-[30px] font-black tracking-tight leading-snug text-black dark:text-white">
                  Essentials
                </h3>
                <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1">
                  The other must-reads from today's national desks.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {essentialStories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}

              <CompactStoryList stories={compactStories} />
            </div>
          </section>

          <CoverageDiffers stories={coverageDiffers} />

          <VoicesOfIndiaFeed stories={voices} />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <TrendingSidebar stories={trendingStories} />
          <LiveWireStream items={wireStories} />
          <WhatsEstablished stories={established} />
          <RecentHistory />
        </div>
      </div>
    </main>
  );
}
