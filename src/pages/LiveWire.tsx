import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NewsService } from "../services/news.service";
import type { LiveWireItem } from "../types";
import { decodeHtmlEntities } from "../utils/decode";

export function LiveWire() {
  const [wireItems, setWireItems] = useState<LiveWireItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    const fetchWire = async () => {
      try {
        const data = await NewsService.getStories();
        setWireItems(data.wire || []);
      } catch (err) {
        console.error("Failed to fetch wire", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWire();
  }, []);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
        return { icon: "check_circle", textClass: "text-on-surface-variant", bgClass: "bg-surface-variant", filled: false };
      case "developing":
        return { icon: "pending", textClass: "text-tertiary-container", bgClass: "bg-tertiary-fixed", filled: false };
      case "breaking":
        return { icon: "warning", textClass: "text-error", bgClass: "bg-error-container", filled: true };
      default:
        return { icon: "info", textClass: "text-secondary", bgClass: "bg-surface-variant", filled: false };
    }
  };

  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-editorial-stack flex flex-col gap-editorial-stack">
      {/* Section Header & Filter */}
      <section className="flex flex-col gap-6">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Live Wire</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Real-time newsroom feed. Chronological timeline of developing stories, verified and corroborated across multiple sources.
          </p>
        </div>
        
        {/* Filter Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-outline-variant/30 w-full">
          {["All", "Politics & Governance", "Economy, Markets & Business", "States & Regions", "Courts, Law & Constitution", "International & Strategy", "Science, Climate & Tech", "Society, Health & Culture"].map(cat => (
            <button 
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 font-label-caps text-label-caps whitespace-nowrap transition-colors ${
                categoryFilter === cat ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Chronological Timeline */}
      <section className="relative timeline-container pl-0 w-full max-w-4xl before:content-[''] before:absolute before:left-[104px] max-md:before:left-[16px] before:top-[24px] before:bottom-0 before:w-px before:bg-outline-variant before:z-0">
        
        {loading ? (
          <div className="font-data-mono text-data-mono text-on-surface-variant">Loading Live Wire...</div>
        ) : wireItems.length === 0 ? (
          <div className="font-data-mono text-data-mono text-on-surface-variant">No live updates currently available.</div>
        ) : (
          wireItems.filter(item => categoryFilter === "All" || item.category === categoryFilter).map((item, index) => {
            const timeStr = formatTime(item.timestamp);
            const statusConfig = getStatusConfig(item.status);
            
            // Determine dot style based on status
            const dotClass = item.status.toLowerCase() === "developing" ? "bg-outline" : "bg-primary";

            return (
              <article key={item.id} className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-8 mb-12 group">
                {/* Timestamp Column */}
                <div className="md:w-20 shrink-0 flex items-start pt-1 md:justify-end bg-surface">
                  <span className="font-data-mono text-data-mono text-on-surface-variant md:pr-4">{timeStr}</span>
                </div>
                
                {/* Desktop Dot */}
                <div className={`absolute left-[16px] md:left-[100px] top-[10px] w-2 h-2 rounded-full ${dotClass} ring-4 ring-surface hidden md:block`}></div>
                
                {/* Content Card */}
                <div className="flex-grow bg-surface border border-outline-variant/30 p-6 rounded-2xl hover:shadow-md hover:border-outline-variant transition-all duration-300 relative group-hover:-translate-y-1">
                  {(() => {
                    const targetId = (item.relatedStoryId && item.relatedStoryId !== "unknown") ? item.relatedStoryId : item.id;
                    return (
                      <>
                        <Link to={`/story/${targetId}`} className="absolute inset-0 z-10 rounded-2xl" aria-label={`Read analysis dossier for ${item.title}`} />
                        {/* Mobile Dot */}
                        <div className={`absolute -left-[13px] top-[24px] w-2 h-2 rounded-full ${dotClass} ring-4 ring-surface md:hidden`}></div>
                        
                        <div className="flex justify-between items-start mb-3 relative z-20">
                          <div className="flex items-center gap-2">
                            <span className="font-label-caps text-label-caps px-2 py-1 bg-surface-variant text-on-surface-variant">
                              {item.category}
                            </span>
                            {item.region && (
                              <span className="font-label-caps text-label-caps text-secondary flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]" data-icon="public">public</span>
                                {item.region}
                              </span>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 ${statusConfig.textClass} ${statusConfig.bgClass} px-2 py-1`}>
                            <span 
                              className="material-symbols-outlined text-[14px]" 
                              data-icon={statusConfig.icon}
                              style={statusConfig.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                              {statusConfig.icon}
                            </span>
                            <span className="font-label-caps text-label-caps">{item.status?.toLowerCase() === "verified" ? "Indexed" : item.status}</span>
                          </div>
                        </div>
                        
                        <h2 className="font-headline-md text-headline-md text-on-surface mb-3 relative z-20">{decodeHtmlEntities(item.title)}</h2>
                        {item.summary && (
                          <p className="font-body-md text-body-md text-on-surface-variant mb-4 line-clamp-2 relative z-20">
                            {item.summary}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-outline-variant/30 relative z-20">
                          <div className="flex items-center gap-2">
                            <span className="font-label-caps text-label-caps text-on-surface-variant">Primary Source:</span>
                            <span className="font-data-mono text-data-mono text-on-surface">{item.source}</span>
                          </div>
                          {/* Related Story Action */}
                          <div className="flex items-center gap-4 ml-auto">
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-1 font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors"
                              title="Original Publisher Dispatch"
                            >
                              <span>Source</span>
                              <span className="material-symbols-outlined text-[14px]" data-icon="open_in_new">open_in_new</span>
                            </a>
                            <Link 
                              to={`/story/${targetId}`} 
                              className="flex items-center gap-1 font-label-caps text-label-caps text-primary hover:underline font-semibold"
                            >
                              <span>View Analysis Dossier</span>
                              <span className="material-symbols-outlined text-[16px]" data-icon="arrow_forward">arrow_forward</span>
                            </Link>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Pagination removed as we are displaying the real-time stream */}
    </main>
  );
}
