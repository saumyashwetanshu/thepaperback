import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NewsService } from "../services/news.service";
import type { NewsStory } from "../types";

export function Explore() {
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        const res = await NewsService.getStories(1, 20);
        setStories(res.stories);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchExploreData();
  }, []);

  // Compute trending narratives (most common categories)
  const categoryCount: Record<string, number> = {};
  // Compute key figures
  const peopleCount: Record<string, number> = {};
  // Compute organizations
  const orgCount: Record<string, number> = {};
  // Compute regions
  const regionCount: Record<string, number> = {};

  stories.forEach(story => {
    if (story.category) {
      categoryCount[story.category] = (categoryCount[story.category] || 0) + 1;
    }
    if (story.entities?.people) {
      story.entities.people.forEach(p => peopleCount[p] = (peopleCount[p] || 0) + 1);
    }
    if (story.entities?.institutions) {
      story.entities.institutions.forEach(o => orgCount[o] = (orgCount[o] || 0) + 1);
    }
    if (story.region) {
      regionCount[story.region] = (regionCount[story.region] || 0) + 1;
    }
  });

  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Global Affairs";
  const topPeople = Object.entries(peopleCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(e => e[0]);
  const topOrgs = Object.entries(orgCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topRegion = Object.entries(regionCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Global Corridors";

  return (
    <main className="flex-grow flex flex-col md:flex-row w-full max-w-[1440px] mx-auto relative px-4 md:px-8">
      <div className="flex-grow flex flex-col w-full py-8 md:py-12">
        
        {/* Search & Hero Canvas */}
        <div className="w-full max-w-4xl mx-auto mb-12 text-center">
          <h1 className="font-black text-3xl md:text-5xl tracking-tight text-black dark:text-white mb-6">Explore</h1>
          <div className="relative w-full max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
              <span className="material-symbols-outlined" data-icon="search">search</span>
            </div>
            <input 
              type="text"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white focus:ring-0 outline-none rounded-2xl text-lg text-black dark:text-white transition-colors placeholder:text-gray-400" 
              placeholder="Search topics, people, and regions..." 
            />
          </div>
        </div>

        {/* Bento Grid Exploration */}
        {loading ? (
          <div className="text-center font-bold text-gray-400 animate-pulse">Loading Trends...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
            
            {/* Trending Node (Spans 8) */}
            <Link to={`/search?q=${encodeURIComponent(topCategory)}`} className="md:col-span-8 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 relative overflow-hidden group hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-pointer min-h-[300px] flex flex-col rounded-2xl">
              <div className="flex items-center gap-2 mb-4 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600">Trending Narratives</span>
              </div>
              <div className="flex-grow flex flex-col justify-end border-t border-gray-200 dark:border-gray-800 pt-4">
                <h2 className="font-bold text-2xl md:text-3xl tracking-tight text-black dark:text-white mb-2 group-hover:text-rose-600 transition-colors">{topCategory}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Emerging alliances and recalibrations observed across recent developments.</p>
              </div>
            </Link>

            {/* Key People (Spans 4) */}
            <Link to="/search?type=person" className="md:col-span-4 bg-gray-100 dark:bg-gray-800 p-6 flex flex-col justify-between group hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer border-t-4 border-rose-600 rounded-2xl">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Key Figures</span>
                </div>
                <h3 className="font-bold text-xl tracking-tight text-black dark:text-white mb-2">
                  {topPeople[0] || "Prominent Leaders"}
                </h3>
              </div>
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <span className="text-[12px] font-semibold text-gray-500">{topPeople.length} Profiles Tracked</span>
                <span className="text-gray-400">→</span>
              </div>
            </Link>

            {/* Organizations (Spans 4) */}
            <Link to="/search?type=org" className="md:col-span-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 hover:shadow-sm transition-shadow cursor-pointer rounded-2xl">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Organizations</span>
              </div>
              <h3 className="font-bold text-lg tracking-tight text-black dark:text-white mb-4">Highly Cited Institutions</h3>
              <ul className="space-y-3">
                {topOrgs.length > 0 ? topOrgs.map(([org, count], i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold line-clamp-1">{org}</span>
                    <span className="text-[11px] font-bold text-gray-400 ml-2">{count} refs</span>
                  </li>
                )) : (
                  <li className="text-gray-500 text-sm">No organizations tracked</li>
                )}
              </ul>
            </Link>

            {/* Places / Geopolitics (Spans 8) */}
            <Link to={`/search?type=region&q=${encodeURIComponent(topRegion)}`} className="md:col-span-8 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 relative overflow-hidden h-[250px] group cursor-pointer flex items-end rounded-2xl"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800&h=600')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
              <div className="relative z-10 p-6 w-full border-t border-gray-200/20 backdrop-blur-md bg-black/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">Critical Regions</span>
                </div>
                <h3 className="font-bold text-2xl text-white group-hover:text-rose-400 transition-colors">{topRegion}</h3>
              </div>
            </Link>

          </div>
        )}
      </div>
    </main>
  );
}
