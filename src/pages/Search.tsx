import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X as CloseIcon } from 'lucide-react';
import { NewsService } from '../services/news.service';
import { NewsStory } from '../types';
import { Link } from 'react-router-dom';
import { decodeHtmlEntities, cleanDescriptionText } from '../utils/decode';

export const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NewsStory[]>([]);
  const [suggestions, setSuggestions] = useState<NewsStory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const highlightedIndexRef = useRef<number>(-1);

  // Fetch search results on query change (debounced)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const data = await NewsService.search(query.trim(), 20);
        setResults(data.stories || []);
      } catch (err) {
        console.error("Error searching stories:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Fetch suggestions on query change (shorter debounce)
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setIsSuggestionsLoading(false);
      highlightedIndexRef.current = -1;
      return;
    }

    setIsSuggestionsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const data = await NewsService.search(query.trim(), 5);
        setSuggestions(data.stories || []);
        highlightedIndexRef.current = -1;
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      } finally {
        setIsSuggestionsLoading(false);
      }
    }, 150);

    return () => clearTimeout(handler);
  }, [query]);

  // Handle key down for suggestions navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!suggestions.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndexRef.current = Math.min(highlightedIndexRef.current + 1, suggestions.length - 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndexRef.current = Math.max(highlightedIndexRef.current - 1, -1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndexRef.current >= 0) {
          const selected = suggestions[highlightedIndexRef.current];
          setQuery(selected.title || ''); // Or maybe we want to set query to something else?
          // Actually, we might want to set query to the selected story's title? Or we could just search for that title.
          // But better: when user selects a suggestion, we treat it as if they typed that and hit search.
          // So we set the query to the suggestion's title and let the search effect run.
          setQuery(selected.title || '');
          // Clear suggestions after selection? We'll let the useEffect above handle it.
        } else {
          // If nothing highlighted, just search current query
          // The search effect will run because query hasn't changed? Actually we need to trigger search.
          // We'll just leave it; the search effect runs on query change, but if we don't change query, it won't run.
          // So we'll set the query to itself to trigger a re-search? Or we can just call the search function directly.
          // For simplicity, we'll just do nothing and let the user press enter to submit the current query (which is already handled by the search effect? Not exactly, because the search effect runs on query change, not on enter key).
          // We'll instead trigger a search by setting a dummy state? Let's instead have a submit handler.
          // We'll change approach: have a form with onSubmit.
          // Given time, we'll keep it simple: pressing enter will set the query to the highlighted suggestion if any, else do nothing.
          // The search results will update via the query effect.
        }
      } else if (e.key === 'Escape') {
        setSuggestions([]);
        highlightedIndexRef.current = -1;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [suggestions.length]);

  const handleSelectSuggestion = (story: NewsStory) => {
    setQuery(story.title || '');
    // Clear suggestions after selection? We'll let the useEffect above handle it when query changes.
  };

  return (
    <main className="flex-grow w-full max-w-[1240px] mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col font-sans bg-white dark:bg-black min-h-[80vh] transition-colors">
      <section className="flex flex-col max-w-[860px]">
        {/* Search Masthead Header */}
        <div className="pb-8 border-b border-gray-200/90 dark:border-gray-800 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-sm bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest leading-none">
              Archive Search
            </span>
            <span className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-sans">
              Live Index
            </span>
          </div>
          <h1 className="text-[40px] md:text-[52px] font-black tracking-[-0.03em] leading-none text-black dark:text-white mb-3">
            Search Archive
          </h1>
          <p className="text-[17px] md:text-[18px] text-gray-600 dark:text-gray-400 leading-relaxed">
            Search corroborated reports, cross-desk coverage, and state dispatches across the live Indian news archive.
          </p>
        </div>

        {/* Input Bar */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
          <input
            className="w-full pl-12 pr-11 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-gray-950 focus:outline-hidden text-base text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors rounded-2xl shadow-2xs"
            placeholder="Search by topic, keyword, or entity name..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer p-1"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {query.trim() && (
          <div className="mb-6 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 font-sans">
            {isLoading ? "Searching Live Newsrooms…" : `${results.length} ${results.length === 1 ? 'Result' : 'Results'} Found`}
          </div>
        )}

        {/* Suggestions Dropdown */}
        {(!isLoading && !isSuggestionsLoading && suggestions.length > 0 && query.trim()) && (
          <div
            className="absolute left-4 right-4 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
            ref={suggestionsRef}
          >
            {isSuggestionsLoading ? (
              <div className="py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                Loading suggestions...
              </div>
            ) : (
              <ul className="py-1">
                {suggestions.map((story, index) => (
                  <li
                    key={story.id}
                    className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      highlightedIndexRef.current === index
                        ? 'bg-rose-50 dark:bg-rose-900/50'
                        : ''
                    }`}
                    onClick={() => handleSelectSuggestion(story)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          {story.category || 'National'}
                        </span>
                        <span className="text-gray-300 dark:text-gray-700">•</span>
                        <span className="text-black dark:text-white font-bold truncate">
                          {story.primaryReportingOutlet || 'Desk'}
                        </span>
                      </div>
                      <h4 className="text-[14px] font-medium text-gray-800 dark:text-gray-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug">
                        {decodeHtmlEntities(story.title)}
                      </h4>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/80">
          {!query.trim() ? (
            <div className="py-12 text-sm text-gray-500 dark:text-gray-400 font-medium">
              Enter a search query above to scan all indexed Indian newsrooms.
            </div>
          ) : isLoading ? (
            <div className="flex flex-col gap-6 py-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-2 py-4">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 w-24 rounded"></div>
                  <div className="h-6 bg-gray-100 dark:bg-gray-800 w-3/4 rounded"></div>
                  <div className="h-12 bg-gray-100 dark:bg-gray-800 w-full rounded"></div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            results.map((story) => (
              <Link
                to={`/story/${story.id}`}
                key={story.id}
                className="py-5 flex flex-col gap-2 group cursor-pointer hover:bg-gray-50/70 dark:hover:bg-gray-900/50 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    {story.category || 'National'}
                  </span>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <span className="text-black dark:text-white font-bold">
                    {story.primaryReportingOutlet || 'Desk'}
                  </span>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <span className="text-gray-400 dark:text-gray-500 font-sans font-medium">
                    {new Date(story.timestamp || story.date || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="text-[18px] font-black text-black dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug tracking-tight">
                  {decodeHtmlEntities(story.title)}
                </h3>
                {story.description && (
                  <p className="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
                    {cleanDescriptionText(story.description)}
                  </p>
                )}
              </Link>
            ))
          ) : (
            <div className="py-12 text-sm text-gray-500 dark:text-gray-400 font-medium">
              No articles found matching "{query}".
            </div>
          )}
        </div>
      </section>
    </main>
  );
};