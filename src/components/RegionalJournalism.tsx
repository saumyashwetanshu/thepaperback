import React, { useState } from "react";
import { Globe } from "lucide-react";
import { NewsStory } from "../types";

interface RegionalJournalismProps {
  stories: NewsStory[];
  onSelectStory: (story: NewsStory) => void;
}

const LANGUAGES = [
  "All",
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Kannada",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Punjabi",
  "Urdu",
  "Odia",
  "Assamese"
];

export function RegionalJournalism({ stories, onSelectStory }: RegionalJournalismProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  const regionalStories = stories.filter(s => 
    selectedLanguage === "All" ? true : s.language === selectedLanguage
  );

  return (
    <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-2xs">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-widest text-stone-700 mb-1">
            <Globe className="h-3.5 w-3.5 text-stone-800" />
            <span>ACROSS INDIA & REGIONAL NEWSROOMS</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-black text-stone-950 tracking-tight">
            India First & Multilingual Intelligence
          </h2>
        </div>

        <span className="bg-stone-100 text-stone-700 font-mono text-[9px] font-black px-3 py-1 rounded-lg border border-stone-200 self-start sm:self-auto">
          25+ REGIONAL LANGUAGE DESKS AUDITED
        </span>
      </div>

      {/* Language Filter Chips */}
      <div className="space-y-2">
        <span className="font-mono text-[9px] font-black uppercase tracking-widest text-stone-500 block">
          SELECT REGIONAL DESK:
        </span>
        <div className="flex flex-wrap gap-1.5 font-mono text-[10px] uppercase font-bold">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedLanguage === lang
                  ? "bg-stone-900 text-white shadow-3xs font-black"
                  : "bg-stone-100 hover:bg-stone-200 text-stone-800"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Regional Story Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regionalStories.map(story => (
          <div
            key={story.id}
            onClick={() => onSelectStory(story)}
            className="group p-5 bg-stone-50/50 hover:bg-stone-100/80 border border-stone-200/80 hover:border-stone-400 rounded-2xl transition-all cursor-pointer space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-widest text-stone-500 font-bold">
                <span className="bg-stone-200/80 text-stone-900 px-2 py-0.5 rounded border border-stone-300 font-black">
                  {story.region || "Regional"} &bull; {story.language || "English"}
                </span>
                <span className="text-stone-500 font-semibold">{story.category}</span>
              </div>

              <h3 className="font-serif font-bold text-stone-950 text-sm sm:text-base leading-snug group-hover:text-stone-700 transition-colors">
                {story.title}
              </h3>

              <p className="text-xs text-stone-600 font-sans line-clamp-2 leading-relaxed">
                {story.description}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200/60 pt-2.5 font-mono text-[9px] text-stone-600 font-semibold">
              <span className="text-stone-900 font-black group-hover:underline">
                INSPECT REGIONAL FRAMING &rarr;
              </span>
              <span>{story.perspectives.length} SOURCES</span>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
