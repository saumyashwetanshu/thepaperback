import React from "react";
import { RefreshCw } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  activeTab: "feed" | "fact-check" | "pulse" | "methodology";
  setActiveTab: (tab: "feed" | "fact-check" | "pulse" | "methodology") => void;
}

export function Header({
  onRefresh,
  isRefreshing,
  activeTab,
  setActiveTab,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F6]/95 backdrop-blur-xl border-b border-stone-200/80 py-3 px-4 sm:px-6 lg:px-8 shadow-2xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left Side: Black P square logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab("feed")}
            className="flex items-center gap-2 cursor-pointer group text-left"
            title="The Paperback"
          >
            <span className="bg-[#111827] text-white font-serif font-black h-8 w-8 rounded-lg flex items-center justify-center text-lg leading-none transition-all shadow-3xs group-hover:bg-black">
              P
            </span>
          </button>
        </div>

        {/* Center: Segmented Capsule Navigator */}
        <div className="flex items-center justify-center">
          <div className="inline-flex bg-[#ECEEF0] p-1 rounded-2xl border border-stone-200/50 shadow-2xs whitespace-nowrap">
            <button
              onClick={() => setActiveTab("feed")}
              className={`cursor-pointer px-4 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider font-extrabold transition-all duration-150 ${
                activeTab === "feed"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              ANALYSIS
            </button>

            <button
              onClick={() => setActiveTab("fact-check")}
              className={`cursor-pointer px-4 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider font-extrabold transition-all duration-150 ${
                activeTab === "fact-check"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              FACT CHECK
            </button>

            <button
              onClick={() => setActiveTab("pulse")}
              className={`cursor-pointer px-4 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider font-extrabold transition-all duration-150 ${
                activeTab === "pulse"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              THE PULSE
            </button>
          </div>
        </div>

        {/* Right Side: SIGN IN & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all cursor-pointer"
            title="Refresh Feed"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : "text-stone-600"}`} />
          </button>

          <button 
            onClick={() => alert("Sign In module ready.")}
            className="font-mono text-[11px] font-bold text-stone-500 hover:text-stone-900 tracking-widest px-3 py-1.5 uppercase transition-colors cursor-pointer"
          >
            SIGN IN
          </button>
        </div>

      </div>
    </header>
  );
}

