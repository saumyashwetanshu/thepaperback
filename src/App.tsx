import React, { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { NewsCard } from "./components/NewsCard";
import { LiveWire } from "./components/LiveWire";
import { FactCheckModule } from "./components/FactCheckModule";
import { PulseDesk } from "./components/PulseDesk";
import { RegionalJournalism } from "./components/RegionalJournalism";
import { Methodology } from "./components/Methodology";
import { NewsStory, LiveWireItem } from "./types";
import { FALLBACK_STORIES, FALLBACK_WIRE } from "./data/fallbackNews";
import { Search, Newspaper } from "lucide-react";

export default function App() {
  const [stories, setStories] = useState<NewsStory[]>(FALLBACK_STORIES);
  const [wire, setWire] = useState<LiveWireItem[]>(FALLBACK_WIRE);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "fact-check" | "pulse" | "methodology">("feed");

  // Advanced Filtering States
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [, setSelectedStory] = useState<NewsStory | null>(null);

  // Load news feed from server or fallback
  const loadNewsFeed = async (query?: string) => {
    setIsLoading(true);
    try {
      const url = query ? `/api/news?q=${encodeURIComponent(query)}` : "/api/news";
      const newsRes = await fetch(url);
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setStories(newsData.stories && newsData.stories.length > 0 ? newsData.stories : FALLBACK_STORIES);
        setWire(newsData.wire && newsData.wire.length > 0 ? newsData.wire : FALLBACK_WIRE);
      } else {
        setStories(FALLBACK_STORIES);
        setWire(FALLBACK_WIRE);
      }
    } catch (err) {
      console.warn("News feed fetch utilizing fallback corpus:", err);
      setStories(FALLBACK_STORIES);
      setWire(FALLBACK_WIRE);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNewsFeed();
  }, []);

  // Live query search triggering
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length >= 2) {
      const timer = setTimeout(() => {
        loadNewsFeed(trimmed);
      }, 500);
      return () => clearTimeout(timer);
    } else if (trimmed.length === 0) {
      loadNewsFeed();
    }
  }, [searchQuery]);

  const handleWireItemClick = (item: LiveWireItem) => {
    const matchingStory = stories.find(s => 
      s.id === item.relatedStoryId || 
      s.title.toLowerCase().includes(item.title.toLowerCase().substring(0, 15))
    ) || stories[0];

    setSelectedStory(matchingStory);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // Category filter
  const filteredStories = stories.filter(story => {
    const matchesCat = selectedCategory === "All" || story.category === selectedCategory || story.institution === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === "" || 
      story.title.toLowerCase().includes(query) ||
      story.description.toLowerCase().includes(query) ||
      story.category.toLowerCase().includes(query) ||
      story.verifiableConsensus.toLowerCase().includes(query);

    return matchesCat && matchesSearch;
  });

  const categories = ["All", "Economics", "Supreme Court", "RBI", "Government", "Technology", "State Governance"];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-stone-900 selection:bg-stone-200 font-sans">
      
      {/* Top Header Masthead */}
      <Header
        onRefresh={() => loadNewsFeed(searchQuery)}
        isRefreshing={isLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-12">
        
        {activeTab === "feed" && (
          <div className="space-y-12">
            
            {/* HERO SECTION */}
            <div className="text-center py-6 max-w-3xl mx-auto space-y-6">
              <div>
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200 inline-block mb-3">
                  PUBLIC KNOWLEDGE INSTITUTION
                </span>
                <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-stone-950 leading-tight">
                  The Paperback
                </h1>
              </div>
              <p className="text-stone-600 text-sm sm:text-base font-sans max-w-xl mx-auto leading-relaxed font-medium">
                India's constitutional story intelligence platform. Deconstructing selective reporting, narrative diction, and institutional framing.
              </p>

              {/* SEARCH OVAL BAR */}
              <div className="w-full max-w-2xl mx-auto pt-2">
                <div className="relative flex items-center bg-white rounded-full p-2 border border-stone-300 shadow-xs hover:border-stone-500 transition-all">
                  <span className="absolute left-5 text-stone-500">
                    <Search className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search people, institutions, laws, events, or topics (e.g. Modi, CJI, UPSC, Bihar, India-China, RBI)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-28 py-3 text-xs sm:text-sm font-sans text-stone-950 bg-transparent rounded-full focus:outline-none placeholder-stone-400 font-medium"
                  />
                  <button
                    onClick={() => loadNewsFeed(searchQuery)}
                    className="absolute right-2.5 top-2 px-6 py-2.5 bg-[#18181B] text-white font-mono text-[10px] tracking-widest font-black uppercase rounded-full hover:bg-stone-800 transition-all cursor-pointer shadow-3xs active:scale-98"
                  >
                    SEARCH
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 1: INDIA INSTITUTIONAL WIRE */}
            <LiveWire items={wire} onSelectWireItem={handleWireItemClick} />

            {/* SECTION 2: TODAY'S STORY INTELLIGENCE */}
            <div className="space-y-6">
              
              {/* Category Filter Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-4 gap-4">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-stone-900" />
                  <h2 className="font-serif text-xl sm:text-2xl font-black text-stone-950 tracking-tight">
                    Today's Story Intelligence
                  </h2>
                </div>

                <div className="flex overflow-x-auto no-scrollbar gap-1.5 font-mono text-[10px] uppercase font-bold py-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat
                          ? "bg-stone-950 text-white shadow-3xs font-black"
                          : "bg-white hover:bg-stone-100 text-stone-700 border border-stone-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Story Cards List */}
              {isLoading && stories.length === 0 ? (
                <div className="py-20 text-center border border-stone-200 rounded-3xl bg-white flex flex-col items-center justify-center gap-3">
                  <span className="h-8 w-8 text-stone-900 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></span>
                  <p className="font-serif italic text-stone-600">Cross-referencing verified newsroom streams...</p>
                </div>
              ) : filteredStories.length > 0 ? (
                <div className="space-y-6">
                  {filteredStories.map((story) => (
                    <NewsCard key={story.id} story={story} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center border border-stone-200 rounded-3xl bg-white font-sans text-stone-500">
                  No verified reports match your current filter parameters. Try searching or clearing the category selection.
                </div>
              )}

            </div>

            {/* SECTION 3: ACROSS INDIA & REGIONAL NEWSROOMS */}
            <RegionalJournalism 
              stories={stories} 
              onSelectStory={(story) => {
                setSelectedStory(story);
                window.scrollTo({ top: 400, behavior: "smooth" });
              }} 
            />

          </div>
        )}

        {/* TAB 2: FACT CHECK */}
        {activeTab === "fact-check" && (
          <FactCheckModule />
        )}

        {/* TAB 3: THE PULSE OBSERVATORY */}
        {activeTab === "pulse" && (
          <PulseDesk />
        )}

        {/* TAB 4: METHODOLOGY */}
        {activeTab === "methodology" && (
          <Methodology />
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-[#18181B] text-stone-300 border-t border-stone-800 py-12 px-4 sm:px-6 lg:px-8 mt-16 font-mono text-xs select-none">
        <div className="max-w-7xl mx-auto space-y-8 text-left">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-stone-800 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-white text-stone-950 font-serif font-black h-7 w-7 rounded flex items-center justify-center text-sm">
                  P
                </div>
                <span className="font-serif font-black text-base text-white tracking-widest uppercase">
                  THE PAPERBACK
                </span>
              </div>
              <p className="font-sans text-stone-400 text-xs max-w-md leading-relaxed">
                The Paperback. Verifiable Consensus, Visible Uncertainty, and Narrative Intelligence for Indian Media.
              </p>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              <button onClick={() => setActiveTab("feed")} className="hover:text-white transition-colors cursor-pointer">STORY INTELLIGENCE</button>
              <span>&bull;</span>
              <button onClick={() => setActiveTab("fact-check")} className="hover:text-white transition-colors cursor-pointer">FACT CHECK</button>
              <span>&bull;</span>
              <button onClick={() => setActiveTab("pulse")} className="hover:text-white transition-colors cursor-pointer">THE PULSE</button>
              <span>&bull;</span>
              <button onClick={() => setActiveTab("methodology")} className="hover:text-white transition-colors cursor-pointer">METHODOLOGY</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between font-mono text-[10px] text-stone-500 gap-2">
            <span>&copy; {new Date().getFullYear()} The Paperback. Permanent Constitutional Operating Framework.</span>
            <span>PUBLIC KNOWLEDGE INSTITUTION</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
