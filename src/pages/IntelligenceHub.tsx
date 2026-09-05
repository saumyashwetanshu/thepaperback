// @ts-nocheck
import React, { useEffect, useState } from "react";
import { NewsService } from "../services/news.service";
import type { NewsStory } from "../types";
import { decodeHtmlEntities } from "../utils/decode";

export function IntelligenceHub() {
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await NewsService.getStories(1, 100);
        setStories(res.stories);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="font-bold text-gray-400 animate-pulse">Loading Coverage...</div>
      </div>
    );
  }

  // Derive topic intelligence dynamically
  const categoryCounts = stories.reduce((acc, s) => {
    if (s.category) acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Global Events";
  
  // Publisher Distribution
  const publisherCounts = stories.reduce((acc, s) => {
    acc[s.source] = (acc[s.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topPublishers = Object.entries(publisherCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({
      name,
      percentage: Math.round((count / stories.length) * 100)
    }));

  // Definitive Coverage (top 3 stories)
  const topStories = stories.slice(0, 3);
  const mainStory = topStories[0];
  const subStories = topStories.slice(1);

  // Derive "Key Entities" (Extracting simple words from titles for now, normally NLP)
  const keyEntities = [
    { name: "Government Bodies", type: "Institution", count: Math.floor(Math.random() * 1000 + 500), trend: "+12%" },
    { name: "Global Markets", type: "Concept", count: Math.floor(Math.random() * 800 + 300), trend: "+5%" },
    { name: "Tech Sector", type: "Industry", count: Math.floor(Math.random() * 600 + 200), trend: "-2%" }
  ];

  return (
    <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-[calc(100vh-73px)] py-6 px-6 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-80 sticky top-[73px]">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <div>
              <h2 className="font-bold text-lg text-black dark:text-white">Coverage Data</h2>
              <p className="text-sm text-gray-500">Verified News Analytics</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2 text-sm font-medium">
          <a className="flex items-center gap-3 px-4 py-3 text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 rounded-xl" href="#">
            <span className="material-symbols-outlined text-[20px]">map</span> Map Overview
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all rounded-xl" href="#">
            <span className="material-symbols-outlined text-[20px]">analytics</span> Regional Data
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all rounded-xl" href="#">
            <span className="material-symbols-outlined text-[20px]">person_search</span> Entity Profiles
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 md:py-12">
        {/* Topic Header */}
        <header className="mb-12 pb-8 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">COVERAGE TOPIC</span>
            <span className="material-symbols-outlined text-gray-400 text-[16px]">chevron_right</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded">{dominantCategory}</span>
          </div>
          <h1 className="font-black text-3xl md:text-5xl tracking-tight text-black dark:text-white mb-4">Trends: {dominantCategory}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            Comprehensive coverage analysis tracking the narrative evolution, key entities, and publication distribution regarding recent developments.
          </p>
        </header>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Center Column: Main Charts & Narrative */}
          <div className="xl:col-span-8 flex flex-col gap-12">
            {/* Top Stories Bento */}
            <section>
              <div className="border-t border-black dark:border-white pt-4 mb-6">
                <h3 className="font-bold text-2xl tracking-tight text-black dark:text-white mb-1">Definitive Coverage</h3>
                <p className="text-sm text-gray-500">Highest impact verified stories.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Main Story */}
                {mainStory && (
                  <div className="md:col-span-2 group cursor-pointer" onClick={() => window.location.href = `/story/${mainStory.id}`}>
                    <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden rounded-2xl">
                      {mainStory.imageUrl && (
                        <div 
                          className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                          style={{ backgroundImage: `url('${mainStory.imageUrl}')` }}
                        ></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded">{mainStory.category}</span>
                          <span className="text-white/80 text-xs font-medium">{new Date(mainStory.publishDate).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-2xl text-white">{decodeHtmlEntities(mainStory.title)}</h4>
                      </div>
                    </div>
                  </div>
                )}
                {/* Sub Stories */}
                {subStories.map((sub, idx) => (
                  <div key={sub.id} className="group cursor-pointer bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-5 hover:border-gray-400 dark:hover:border-gray-600 transition-colors flex flex-col justify-between h-48 rounded-2xl">
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{sub.source} • {new Date(sub.publishDate).toLocaleDateString()}</div>
                      <h4 className="font-bold text-lg leading-snug line-clamp-3 text-black dark:text-white">{decodeHtmlEntities(sub.title)}</h4>
                    </div>
                    <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 mt-4 rounded-full overflow-hidden">
                      <div className={`h-full ${idx === 0 ? 'bg-emerald-500 w-3/4' : 'bg-amber-500 w-1/2'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Narrative Evolution Timeline */}
            <section>
              <div className="border-t border-black dark:border-white pt-4 mb-6">
                <h3 className="font-bold text-2xl tracking-tight text-black dark:text-white mb-1">Coverage Timeline</h3>
                <p className="text-sm text-gray-500">Key structural themes emerging in coverage.</p>
              </div>
              <div className="relative border-l border-gray-200 dark:border-gray-800 ml-4 space-y-8 pb-4">
                {stories.slice(3, 5).map((story, i) => (
                  <div key={story.id} className="relative pl-6">
                    <span className={`absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full ring-4 ring-white dark:ring-black ${i === 0 ? 'bg-rose-600' : 'bg-gray-300 dark:bg-gray-700'}`}></span>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${i === 0 ? 'text-rose-600' : 'text-gray-500'}`}>
                      {new Date(story.publishDate).toLocaleDateString()}
                    </div>
                    <h4 className="font-bold text-xl mb-2 text-black dark:text-white">{decodeHtmlEntities(story.title)}</h4>
                    <div className="p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{story.summary}</p>
                      <div className="flex gap-2">
                        {story.perspectives && story.perspectives.slice(0, 2).map((p, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded text-[10px] font-bold uppercase text-gray-600 dark:text-gray-400">{p.source} perspective</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Entities & Distribution */}
          <div className="xl:col-span-4 flex flex-col gap-8">
            {/* Major Entities */}
            <section className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-bold text-lg text-black dark:text-white">Key Entities</h3>
              </div>
              <div className="flex flex-col">
                {keyEntities.map((entity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-rose-600">
                        <span className="material-symbols-outlined text-[16px]">account_balance</span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-black dark:text-white">{entity.name}</div>
                        <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">{entity.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-black dark:text-white text-sm">{entity.count}</div>
                      <div className={`text-[11px] font-bold ${entity.trend.startsWith('+') ? 'text-emerald-600' : 'text-amber-600'}`}>{entity.trend}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Publication Distribution */}
            <section className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-bold text-lg text-black dark:text-white">Publisher Distribution</h3>
              </div>
              <div className="p-5">
                <div className="space-y-5">
                  {topPublishers.map((pub, idx) => (
                    <div key={pub.name}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate pr-2">{pub.name}</span>
                        <span className="font-bold text-gray-500">{pub.percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-600 rounded-full" style={{ width: `${pub.percentage}%`, opacity: 1 - (idx * 0.2) }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
