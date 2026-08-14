import React from "react";
import { LiveWireItem } from "../types";

interface LiveWireProps {
  items: LiveWireItem[];
  onSelectWireItem?: (item: LiveWireItem) => void;
}

export function LiveWire({ items, onSelectWireItem }: LiveWireProps) {
  // Preset wire stories matching the exact screenshot layout
  const screenshotWireItems = [
    {
      id: "wire-gdp",
      category: "ECONOMY",
      title: "India's GDP growth remains steady as it prepares to overtake Japan as world's 4th largest economy",
      colorClass: "bg-[#E6F4EA] text-[#137333]",
      relatedStoryId: "gdp-growth-japan-surpass"
    },
    {
      id: "wire-me",
      category: "INTERNATIONAL",
      title: "Persistent Middle East hostilities pose significant risk to global economic stability and Indian energy imports",
      colorClass: "bg-[#E6F4EA] text-[#137333]",
      relatedStoryId: "gdp-growth-japan-surpass"
    },
    {
      id: "wire-youth",
      category: "POLITICS",
      title: "Youth protests intensify over structural employment flaws and recurring national examination scandals",
      colorClass: "bg-[#E8F0FE] text-[#1A73E8]",
      relatedStoryId: "sc-article-39b-property"
    },
    {
      id: "wire-bonds",
      category: "ECONOMY",
      title: "Foreign investors pump record $4.2 billion into Indian government bonds following debt index inclusion",
      colorClass: "bg-[#E6F4EA] text-[#137333]",
      relatedStoryId: "rbi-dividend-payout-2026"
    }
  ];

  const wireList = items && items.length >= 4 ? items.map(item => ({
    id: item.id,
    category: item.category.toUpperCase(),
    title: item.title,
    colorClass: item.category.toLowerCase().includes("politic") || item.category.toLowerCase().includes("court") 
      ? "bg-[#E8F0FE] text-[#1A73E8]" 
      : "bg-[#E6F4EA] text-[#137333]",
    relatedStoryId: item.relatedStoryId || "gdp-growth-japan-surpass"
  })) : screenshotWireItems;

  return (
    <div className="bg-white rounded-[28px] border border-stone-200/80 p-6 sm:p-8 space-y-6 text-left shadow-2xs">
      {/* Header Label with Indigo Dot */}
      <div className="flex items-center gap-2 font-mono text-[11px] font-extrabold tracking-widest text-stone-400 uppercase">
        <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
        <span>LIVE WIRE</span>
      </div>

      {/* Wire Bulletin Items */}
      <div className="space-y-6 divide-y divide-stone-100">
        {wireList.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => {
              if (onSelectWireItem) {
                onSelectWireItem({
                  id: item.id,
                  title: item.title,
                  source: "Live Wire Desk",
                  bias: "center",
                  url: "#",
                  timestamp: "Just now",
                  category: item.category,
                  institution: "Government",
                  status: "Verified",
                  relatedStoryId: item.relatedStoryId
                });
              }
            }}
            className={`cursor-pointer group space-y-1.5 ${idx > 0 ? "pt-5" : ""}`}
          >
            <div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-black tracking-wider uppercase inline-block mb-1 ${item.colorClass}`}>
                {item.category}
              </span>
            </div>
            <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base leading-snug group-hover:text-indigo-600 transition-colors">
              {item.title}
            </h4>
          </div>
        ))}
      </div>
    </div>
  );
}

