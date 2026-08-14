import React from "react";
import { BookOpen, Award, ShieldAlert, Layers, Info, CheckCircle2, Bookmark, GraduationCap, ChevronRight, HelpCircle } from "lucide-react";

export function Methodology() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4 sm:py-8 font-sans selection:bg-indigo-100">
      
      {/* Editorial Header */}
      <div className="text-center space-y-3 pb-8 border-b border-slate-200/60">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[9px] font-mono tracking-widest font-black text-slate-500 uppercase select-none shadow-3xs">
          <GraduationCap className="h-3 w-3 text-slate-400" />
          Protocol Standards & Metrics
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-slate-900 leading-none">
          Our Methodology
        </h1>
        <p className="text-xs sm:text-sm font-sans text-slate-500 max-w-lg mx-auto leading-relaxed">
          An overview of how we analyze narrative structures, source variety, and linguistic neutrality across Indian newsrooms.
        </p>
      </div>

      {/* SECTION 1 — WHAT WE MEASURE */}
      <section id="methodology-section-1" className="space-y-4 text-left">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          <Layers className="h-4 w-4 text-slate-700" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-450 font-black">
            SECTION 1 — WHAT WE MEASURE
          </h2>
        </div>
        <div className="space-y-4">
          <p className="text-sm font-sans text-slate-600 leading-relaxed">
            The Paperback analyzes media framing across 150+ Indian newsrooms using four dimensions derived from Entman's Framing Theory (1993):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs hover:shadow-2xs transition-all space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 text-slate-800 font-mono text-[10px] font-bold border border-slate-200">1</span>
                <h3 className="font-serif font-bold text-sm text-slate-900">Problem Definition</h3>
              </div>
              <p className="text-xs text-slate-505 font-medium leading-relaxed">
                How does the outlet define the core issue? Isolating common descriptors and structural anchors.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs hover:shadow-2xs transition-all space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 text-slate-800 font-mono text-[10px] font-bold border border-slate-200">2</span>
                <h3 className="font-serif font-bold text-sm text-slate-900">Causal Attribution</h3>
              </div>
              <p className="text-xs text-slate-505 font-medium leading-relaxed">
                Who or what does the outlet blame? Pinpointing agent nouns, active directives, and structural scapegoats.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs hover:shadow-2xs transition-all space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 text-slate-800 font-mono text-[10px] font-bold border border-slate-200">3</span>
                <h3 className="font-serif font-bold text-sm text-slate-900">Moral Evaluation</h3>
              </div>
              <p className="text-xs text-slate-505 font-medium leading-relaxed">
                What value judgment is embedded in the coverage? Tracking adjectives, adjectives of scale, and emotional vocabulary.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs hover:shadow-2xs transition-all space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 text-slate-800 font-mono text-[10px] font-bold border border-slate-200">4</span>
                <h3 className="font-serif font-bold text-sm text-slate-900">Recommended Treatment</h3>
              </div>
              <p className="text-xs text-slate-505 font-medium leading-relaxed">
                What solution does the framing imply? Isolating call-to-actions, prospective policies, and recommended reforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — HOW WE SCORE */}
      <section id="methodology-section-2" className="space-y-4 text-left">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          <Award className="h-4 w-4 text-slate-700" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-450 font-black">
            SECTION 2 — HOW WE SCORE
          </h2>
        </div>
        <div className="space-y-4">
          <p className="text-sm font-sans text-slate-600 leading-relaxed">
            Each article is scored across five measurable dimensions:
          </p>
          <div className="space-y-3.5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-serif font-semibold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-150">0-25</span>
                  Source Diversity
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  How many source types are quoted? (Government / Opposition / Expert / Affected Community / Civil Society)
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs font-black text-slate-400 self-start sm:self-center bg-slate-50 border border-slate-150 px-2 py-1 rounded">
                WEIGHT: 25 PTS
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-serif font-semibold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-150">0-25</span>
                  Factual Completeness
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Does headline match article body? Are claims attributed?
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs font-black text-slate-400 self-start sm:self-center bg-slate-50 border border-slate-150 px-2 py-1 rounded">
                WEIGHT: 25 PTS
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-serif font-semibold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-150">0-25</span>
                  Linguistic Neutrality
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are emotionally charged words used? Is passive voice used to avoid accountability?
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs font-black text-slate-400 self-start sm:self-center bg-slate-50 border border-slate-150 px-2 py-1 rounded">
                WEIGHT: 25 PTS
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-serif font-semibold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-150">0-25</span>
                  Contextual Fairness
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are opposing viewpoints represented? Is critical context omitted?
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs font-black text-slate-400 self-start sm:self-center bg-slate-50 border border-slate-150 px-2 py-1 rounded">
                WEIGHT: 25 PTS
              </span>
            </div>

            <div className="bg-gradient-to-r from-slate-950 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
                  TOTAL METRIC
                </h3>
                <p className="font-serif font-extrabold text-lg text-white">
                  TOTAL CREDIBILITY SCORE
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans max-w-lg">
                  Aggregated sum of all core indicators providing an absolute benchmark of structural completeness.
                </p>
              </div>
              <span className="shrink-0 font-mono text-sm font-black text-indigo-400 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl">
                0 - 100 SCALE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHAT WE DO NOT CLAIM */}
      <section id="methodology-section-3" className="space-y-4 text-left">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          <ShieldAlert className="h-4 w-4 text-slate-700" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-450 font-black">
            SECTION 3 — WHAT WE DO NOT CLAIM
          </h2>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs">
          <ul className="space-y-3.5 font-sans text-xs sm:text-sm text-slate-650">
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0 mt-2"></span>
              <span className="leading-relaxed">We do not label outlets as “biased” or “unbiased”.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0 mt-2"></span>
              <span className="leading-relaxed">We do not make political judgments.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0 mt-2"></span>
              <span className="leading-relaxed">We measure framing patterns, not editorial intent.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0 mt-2"></span>
              <span className="leading-relaxed">AI analysis is a starting point, not a final verdict.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0 mt-2"></span>
              <span className="leading-relaxed">All scores should be read as indicators, not absolute truth.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* SECTION 4 — OUR AI METHODOLOGY */}
      <section id="methodology-section-4" className="space-y-4 text-left">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          <BookOpen className="h-4 w-4 text-slate-700" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-450 font-black">
            SECTION 4 — OUR AI METHODOLOGY
          </h2>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs space-y-3.5">
          <p className="text-xs sm:text-sm text-slate-650 leading-relaxed">
            All analysis is performed by Gemini Flash 3.5 using structured prompts anchored to academic framing theory. Every score is explainable — users can see exactly why an outlet scored what it did.
          </p>
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-3">
            <span className="p-1 rounded bg-[#eaefff] text-indigo-600 font-mono text-[9px] font-black uppercase">Model</span>
            <span className="font-mono text-[11px] text-slate-600">Google Gemini 3.5 Flash Protocol API Engine</span>
          </div>
        </div>
      </section>

      {/* SECTION 5 — LIMITATIONS & TRANSPARENCY */}
      <section id="methodology-section-5" className="space-y-4 text-left">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          <Info className="h-4 w-4 text-slate-700" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-450 font-black">
            SECTION 5 — LIMITATIONS & TRANSPARENCY
          </h2>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs">
          <ul className="space-y-3.5 font-sans text-xs sm:text-sm text-slate-650">
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0 mt-2"></span>
              <span className="leading-relaxed">AI models can have inherent biases in training data.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0 mt-2"></span>
              <span className="leading-relaxed">Regional language analysis may be less precise than English.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0 mt-2"></span>
              <span className="leading-relaxed">RSS feed coverage depends on outlet availability.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0 mt-2"></span>
              <span className="leading-relaxed">We actively seek academic review of our methodology.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0 mt-2"></span>
              <span className="leading-relaxed">Methodology is updated as we learn and improve.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* SECTION 6 — ACADEMIC REFERENCES */}
      <section id="methodology-section-6" className="space-y-4 text-left pb-8">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          <Bookmark className="h-4 w-4 text-slate-700" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-450 font-black">
            SECTION 6 — ACADEMIC REFERENCES
          </h2>
        </div>
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 space-y-4">
          <ul className="space-y-3 font-mono text-[11px] text-slate-550 leading-relaxed select-text">
            <li className="flex gap-2">
              <span className="text-indigo-600 font-extrabold shrink-0">•</span>
              <span>Entman, R.M. (1993). Framing: Toward Clarification of a Fractured Paradigm. Journal of Communication, 43(4), 51-58.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-600 font-extrabold shrink-0">•</span>
              <span>Tuchman, G. (1978). Making News: A Study in the Construction of Reality. Free Press.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-600 font-extrabold shrink-0">•</span>
              <span>Hallin, D.C. (1986). The Uncensored War. University of California Press.</span>
            </li>
          </ul>
        </div>
      </section>

    </div>
  );
}
