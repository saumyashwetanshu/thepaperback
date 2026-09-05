import React from "react";
import { Link } from "react-router-dom";
import type { LiveWireItem } from "../../types";

export function LiveWireStream({ items }: { items: LiveWireItem[] }) {
  if (!items || items.length === 0) return null;
  
  return (
    <section className="bg-white dark:bg-gray-950 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800 mb-2">
        <Link to="/live" className="flex items-center gap-2 group cursor-pointer">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
          <h3 className="text-[12px] font-bold text-black dark:text-white uppercase tracking-widest group-hover:text-rose-600 transition-colors">
            Live Wire
          </h3>
        </Link>
        <Link to="/live" className="text-[10px] font-bold uppercase text-gray-400 hover:text-gray-900 dark:hover:text-white tracking-widest font-sans flex items-center gap-1 transition-colors">
          View All <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
        </Link>
      </div>
      
      <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/80">
        {items.slice(0, 6).map((item, i) => {
          const targetId = (item.relatedStoryId && item.relatedStoryId !== "unknown") ? item.relatedStoryId : item.id;

          return (
            <Link 
              key={item.id || i} 
              to={`/story/${targetId}`}
              className="py-3 px-1.5 flex flex-col gap-1.5 hover:bg-gray-50/70 dark:hover:bg-gray-900/50 rounded-lg transition-colors group cursor-pointer block"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors text-[10px]">
                    {item.source}
                  </span>
                  <span className="text-[9px] font-sans font-semibold px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                    Dossier
                  </span>
                </div>
                <span className="font-sans text-[10px] text-gray-400 dark:text-gray-500">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-[13.5px] font-normal text-gray-800 dark:text-gray-200 leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                {item.title}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
