import React from "react";

export const Protocol = () => {
  return (
    <div className="flex-grow w-full max-w-[840px] mx-auto px-4 md:px-8 py-12 md:py-16 text-black dark:text-white font-sans transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 rounded-sm bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest leading-none">
          Editorial Standard
        </span>
        <span className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-sans">
          Transparency Protocol
        </span>
      </div>
      <h1 className="text-[40px] md:text-[54px] font-black tracking-[-0.03em] leading-tight mb-4">
        The Paperback Protocol
      </h1>
      <p className="text-[19px] md:text-[20px] text-gray-600 dark:text-gray-400 leading-relaxed mb-12">
        We do not rate outlets left or right. We cluster the same event across diverse Indian newsrooms, cross-corroborate factual consensus, highlight narrative divergence, and cite the original journalism.
      </p>

      <section className="border-t border-gray-200/90 dark:border-gray-800 pt-8 mb-10">
        <h2 className="text-[22px] font-black mb-3 text-black dark:text-white tracking-tight">The 4 Verification Pillars</h2>
        <p className="text-[16px] text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          For every story across Indian journalism, our engine tracks:
        </p>
        <ol className="list-decimal pl-6 space-y-2.5 text-[15px] text-gray-700 dark:text-gray-300">
          <li><strong>Primary Event:</strong> The verified central occurrence reported by the initial wire.</li>
          <li><strong>Agency & Actors:</strong> Who is identified as acting, speaking, or held accountable.</li>
          <li><strong>Empirical Facts:</strong> Exact names, official figures, court orders, and direct quotes.</li>
          <li><strong>Remedy & Policy:</strong> Proposed directives, investigations, or next steps.</li>
        </ol>
      </section>

      <section className="border-t border-gray-200/90 dark:border-gray-800 pt-8 mb-10">
        <h2 className="text-[22px] font-black mb-3 text-black dark:text-white tracking-tight">Editorial Sections</h2>
        <ul className="space-y-3 text-[15px] text-gray-700 dark:text-gray-300">
          <li>
            <strong className="text-black dark:text-white">Today:</strong> Multi-outlet editorial briefing with live wire consensus and share of voice.
          </li>
          <li>
            <strong className="text-black dark:text-white">Fact Check:</strong> Cross-desk claim corroboration backed by indexed primary reporting.
          </li>
          <li>
            <strong className="text-black dark:text-white">Voices of India:</strong> State newsrooms, regional dispatches, and Northeast desks.
          </li>
          <li>
            <strong className="text-black dark:text-white">Pulse:</strong> Explicitly labeled analytical commentary and columnist perspectives.
          </li>
        </ul>
      </section>
    </div>
  );
};
