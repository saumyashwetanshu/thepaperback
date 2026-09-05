// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { NewsService, NewsResponse } from '../services/news.service';
import { decodeHtmlEntities } from '../utils/decode';

export const Profile = () => {
  const [data, setData] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const result = await NewsService.getStories(1, 2);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="flex-1 flex max-w-[1440px] mx-auto w-full">
      <main className="flex-1 px-margin-mobile md:px-margin-desktop py-editorial-stack flex flex-col gap-editorial-stack w-full">
        {/* Dashboard Header */}
        <section className="flex flex-col gap-4 border-b border-outline-variant pb-6">
          <h1 className="font-display-lg text-display-lg text-on-surface">Your News Pulse</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Curated intelligence based on your tracked entities, regional interests, and narrative watchlists. Updated in real-time.</p>
        </section>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Main Narrative Stream (Col span 8) */}
          <div className="md:col-span-8 flex flex-col gap-intelligence-gap">
            <div className="flex justify-between items-end border-b border-outline-variant pb-2">
              <h2 className="font-headline-md text-headline-md">Developing Stories</h2>
              <span className="font-label-caps text-label-caps text-on-surface-variant">Followed Topics</span>
            </div>
            
            {loading ? (
              <div className="py-8 flex justify-center text-on-surface-variant">Analysis pending...</div>
            ) : data && data.stories.length > 0 ? (
              data.stories.map((story) => (
                <article key={story.id} className="bg-surface-container-lowest border border-outline-variant rounded p-6 flex flex-col gap-4 hover:border-primary transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-label-caps text-primary bg-primary-container/20 px-2 py-1 rounded">
                      {story.topics?.[0] || 'Intelligence'}
                    </span>
                    <span className="font-data-mono text-data-mono text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span> {story.publishedAt}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm group-hover:text-primary transition-colors">{decodeHtmlEntities(story.title)}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">{story.summary}</p>
                  
                  <div className="mt-2 h-1 w-full bg-surface-variant rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 w-[60%]" title="Verified Fact"></div>
                    <div className="h-full bg-amber-500 w-[30%]" title="Developing"></div>
                    <div className="h-full bg-red-500 w-[10%]" title="Disputed"></div>
                  </div>
                </article>
              ))
            ) : (
              <div className="py-8 flex justify-center text-on-surface-variant">No stories found for your profile.</div>
            )}
          </div>

          {/* Telemetry & Widgets (Col span 4) */}
          <aside className="md:col-span-4 flex flex-col gap-gutter">
            {/* Consumption Telemetry Widget */}
            <div className="bg-surface-container-low border border-outline-variant p-6 rounded flex flex-col gap-4">
              <h3 className="font-headline-sm text-headline-sm border-b border-outline-variant pb-2">Consumption Telemetry</h3>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-body-md">Information Diet</span>
                  <span className="font-data-mono text-data-mono text-primary">Balanced</span>
                </div>
                <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden flex">
                  <div className="bg-primary h-full" style={{ width: '45%' }}></div>
                  <div className="bg-tertiary h-full" style={{ width: '35%' }}></div>
                  <div className="bg-secondary h-full" style={{ width: '20%' }}></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-on-surface-variant font-data-mono">
                  <span>Policy (45%)</span>
                  <span>Tech (35%)</span>
                  <span>Econ (20%)</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between items-center">
                <span className="font-label-caps text-label-caps">Fact-Check Reliance</span>
                <span className="font-data-mono text-data-mono text-emerald-600">High</span>
              </div>
            </div>

            {/* Saved Dossiers Widget */}
            <div className="bg-surface-container-low border border-outline-variant p-6 rounded flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                <h3 className="font-headline-sm text-headline-sm">Active Dossiers</h3>
                <button aria-label="add" className="text-primary hover:text-primary/80">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              <ul className="flex flex-col gap-intelligence-gap">
                <li className="flex items-center gap-3 p-2 hover:bg-surface-container-highest rounded cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-outline">folder_open</span>
                  <span className="font-body-md text-body-md flex-1">Eurasian Trade Routes</span>
                  <span className="font-data-mono text-data-mono text-on-surface-variant text-xs">12 items</span>
                </li>
                <li className="flex items-center gap-3 p-2 hover:bg-surface-container-highest rounded cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-outline">folder_open</span>
                  <span className="font-body-md text-body-md flex-1">Semiconductor Supply</span>
                  <span className="font-data-mono text-data-mono text-on-surface-variant text-xs">8 items</span>
                </li>
                <li className="flex items-center gap-3 p-2 hover:bg-surface-container-highest rounded cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-outline">folder_open</span>
                  <span className="font-body-md text-body-md flex-1">Climate Agreements</span>
                  <span className="font-data-mono text-data-mono text-on-surface-variant text-xs">24 items</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
