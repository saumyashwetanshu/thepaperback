import React, { useEffect, useState } from "react";
import { NewsService } from "../services/news.service";
import { Link } from "react-router-dom";
import type { NewsStory } from "../types";

export function VoicesOfIndia() {
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedState, setSelectedState] = useState<string>("All States");
  const [selectedTopic, setSelectedTopic] = useState<string>("All Topics");
  const [stats, setStats] = useState<{totalAnalyzed: number; blindspotsDetected: number}>({ totalAnalyzed: 0, blindspotsDetected: 0 });

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await NewsService.getVoicesOfIndia();
        if (res && res.success) {
          setStories(res.blindspots);
          setStats(res.stats);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchVoices();
  }, []);

  const availableStates = ["All States", ...Array.from(new Set(stories.map(s => s.region).filter(Boolean)))];
  const availableTopics = ["All Topics", ...Array.from(new Set(stories.map(s => s.category).filter(Boolean)))];

  const filteredStories = stories.filter(s => {
    if (selectedState !== "All States" && s.region !== selectedState) return false;
    if (selectedTopic !== "All Topics" && s.category !== selectedTopic) return false;
    return true;
  });

  return (
    <div className="flex flex-col flex-1 max-w-[1240px] mx-auto w-full px-4 md:px-10 py-8 md:py-12 bg-white dark:bg-black font-sans transition-colors">
      
      {/* Header */}
      <header className="mb-10 border-b border-gray-200/90 dark:border-gray-800 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded-sm bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest leading-none">
                Regional Desk
              </span>
              <span className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-sans">
                State Dispatches
              </span>
            </div>
            <h1 className="text-[40px] md:text-[52px] font-black tracking-[-0.03em] leading-none text-black dark:text-white mb-3">
              Voices of India
            </h1>
            <p className="text-[17px] md:text-[18px] text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
              Regional dispatches, state newsrooms, and ground reporting across India's diverse geographies.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-full">
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
             <span className="text-[12px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 font-sans">{stories.length} Dispatches Active</span>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="flex flex-col sm:flex-row gap-6 mb-10 pb-6 border-b border-gray-100 dark:border-gray-800/80">
        <div className="w-full sm:w-64">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-2 uppercase tracking-widest">Region / State</label>
          <select 
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-gray-300 dark:border-gray-700 py-2 focus:border-black dark:focus:border-white focus:ring-0 text-base text-black dark:text-white transition-colors outline-none cursor-pointer font-medium"
          >
            {availableStates.map(state => (
              <option key={state as string} value={state as string} className="bg-white dark:bg-gray-900 text-black dark:text-white">{state}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-64">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-2 uppercase tracking-widest">Topic</label>
          <select 
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-gray-300 dark:border-gray-700 py-2 focus:border-black dark:focus:border-white focus:ring-0 text-base text-black dark:text-white transition-colors outline-none cursor-pointer font-medium"
          >
            {availableTopics.map(topic => (
              <option key={topic as string} value={topic as string} className="bg-white dark:bg-gray-900 text-black dark:text-white">{topic}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-[20px] font-bold text-gray-400 py-12">Mapping regional coverage...</div>
        ) : filteredStories.length === 0 ? (
          <div className="col-span-full text-center text-base text-gray-500 py-12">No stories on the wire for the selected filters.</div>
        ) : (
          filteredStories.map((story) => (
            <article 
              key={story.id} 
              className="flex flex-col justify-between bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 shadow-2xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {story.region || "Regional"}
                  </span>
                  <span className="text-gray-300 dark:text-gray-700">&bull;</span>
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{story.category}</span>
                </div>
                
                <h2 className="text-[20px] font-black tracking-tight leading-snug text-black dark:text-white mb-2.5 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  <Link to={`/story/${story.id}`}>{story.title}</Link>
                </h2>

                <p className="text-[14px] text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed mb-4">
                  {story.description}
                </p>
              </div>
              
              <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800/80">
                <span className="font-sans text-[12px] text-gray-400 dark:text-gray-500">
                  {new Date(story.timestamp).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                  {story.sourceCount} Regional {story.sourceCount === 1 ? 'Desk' : 'Desks'}
                </span>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
