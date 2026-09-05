import React from 'react';
import type { NewsStory } from "../../types";

interface DataAuditProps {
  story: NewsStory;
}

export const DataAudit: React.FC<DataAuditProps> = ({ story }) => {
  return (
    <div className="flex flex-col gap-editorial-stack w-full max-w-4xl pt-8">
      <header>
        <h1 className="font-display-lg text-display-lg text-on-surface mb-4">Facts & Figures: {story.title}</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">A comprehensive analysis of the economic indicators driving the latest narrative shift in global supply chains. Data updated hourly from verified Paperback sources.</p>
      </header>

      {/* Key Statistics Bento */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Indexed data point */}
        <article className="border-t border-on-surface bg-surface pt-4 pb-6 px-4 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Coverage Volume</span>
            <span className="flex items-center gap-1 text-[#059669] font-label-caps text-label-caps uppercase">
              <span className="material-symbols-outlined text-[16px]">check_circle</span> Indexed
            </span>
          </div>
          <div className="font-display-sm text-display-sm text-on-surface">2.4M</div>
          <div className="flex justify-between items-center mt-auto pt-4 border-t border-outline-variant">
            <span className="font-data-mono text-data-mono text-on-surface-variant">Reuters API</span>
            <span className="font-data-mono text-data-mono text-on-surface-variant">Oct 24, 09:00Z</span>
          </div>
          <div className="w-full h-1 bg-[#059669] mt-2"></div>
        </article>

        {/* Estimated Data Point */}
        <article className="border-t border-on-surface bg-surface pt-4 pb-6 px-4 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Economic Impact</span>
            <span className="flex items-center gap-1 text-[#d97706] font-label-caps text-label-caps uppercase">
              <span className="material-symbols-outlined text-[16px]">pending</span> Estimated
            </span>
          </div>
          <div className="font-display-sm text-display-sm text-on-surface">$45.2B</div>
          <div className="flex justify-between items-center mt-auto pt-4 border-t border-outline-variant">
            <span className="font-data-mono text-data-mono text-on-surface-variant">World Bank Proj.</span>
            <span className="font-data-mono text-data-mono text-on-surface-variant">Q4 2024</span>
          </div>
          <div className="w-full h-1 bg-[#d97706] mt-2"></div>
        </article>

        {/* Disputed Data Point */}
        <article className="border-t border-on-surface bg-surface pt-4 pb-6 px-4 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Supply Chain Delay</span>
            <span className="flex items-center gap-1 text-[#dc2626] font-label-caps text-label-caps uppercase">
              <span className="material-symbols-outlined text-[16px]">warning</span> Disputed
            </span>
          </div>
          <div className="font-display-sm text-display-sm text-on-surface">+18 Days</div>
          <div className="flex justify-between items-center mt-auto pt-4 border-t border-outline-variant">
            <span className="font-data-mono text-data-mono text-on-surface-variant">Multiple Sources</span>
            <span className="font-data-mono text-data-mono text-on-surface-variant">Oct 22, 14:30Z</span>
          </div>
          <div className="w-full h-1 bg-[#dc2626] mt-2"></div>
        </article>
      </section>

      {/* Detailed Chart Section */}
      <section className="bg-surface-bright border border-outline-variant p-6">
        <header className="flex justify-between items-end mb-6 pb-4 border-b border-outline-variant">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Narrative Velocity Over Time</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Comparing mainstream media mentions vs. social media propagation.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary"></div>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Mainstream</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-primary"></div>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Social</span>
            </div>
          </div>
        </header>

        {/* Mock Line Chart Area */}
        <div className="relative w-full h-[300px] border-l border-b border-outline-variant flex items-end">
          <div className="absolute -left-12 h-full flex flex-col justify-between text-right w-10 py-2">
            <span className="font-data-mono text-data-mono text-on-surface-variant text-xs">100k</span>
            <span className="font-data-mono text-data-mono text-on-surface-variant text-xs">75k</span>
            <span className="font-data-mono text-data-mono text-on-surface-variant text-xs">50k</span>
            <span className="font-data-mono text-data-mono text-on-surface-variant text-xs">25k</span>
            <span className="font-data-mono text-data-mono text-on-surface-variant text-xs">0</span>
          </div>
          <div className="absolute -bottom-8 w-full flex justify-between px-4">
            <span className="font-data-mono text-data-mono text-on-surface-variant text-xs">Oct 18</span>
            <span className="font-data-mono text-data-mono text-on-surface-variant text-xs">Oct 20</span>
            <span className="font-data-mono text-data-mono text-on-surface-variant text-xs">Oct 22</span>
            <span className="font-data-mono text-data-mono text-on-surface-variant text-xs">Oct 24</span>
          </div>
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
            <line stroke="#c7c4d8" strokeDasharray="2,2" strokeWidth="0.5" x1="0" x2="100" y1="25" y2="25"></line>
            <line stroke="#c7c4d8" strokeDasharray="2,2" strokeWidth="0.5" x1="0" x2="100" y1="50" y2="50"></line>
            <line stroke="#c7c4d8" strokeDasharray="2,2" strokeWidth="0.5" x1="0" x2="100" y1="75" y2="75"></line>
            <path d="M0,90 Q20,80 40,50 T80,30 T100,10" fill="none" stroke="#3525cd" strokeWidth="2"></path>
            <circle cx="40" cy="50" fill="#3525cd" r="1.5"></circle>
            <circle cx="80" cy="30" fill="#3525cd" r="1.5"></circle>
            <path d="M0,95 Q30,90 50,60 T70,40 T100,20" fill="none" stroke="#3525cd" strokeDasharray="4,2" strokeWidth="1.5"></path>
          </svg>
        </div>
      </section>

      {/* Intelligence Data Table */}
      <section>
        <h3 className="font-headline-sm text-headline-sm text-on-surface border-b border-outline-variant pb-2 mb-4">Source Breakdown</h3>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-on-surface">
                <th className="font-label-caps text-label-caps text-on-surface-variant uppercase py-3 px-4">Entity/Source</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant uppercase py-3 px-4">Metric</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant uppercase py-3 px-4 text-right">Value</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant uppercase py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="font-data-mono text-data-mono">
              <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                <td className="py-3 px-4 text-on-surface group-hover:text-primary transition-colors">Bloomberg Terminal</td>
                <td className="py-3 px-4 text-on-surface-variant">Market Cap Shift</td>
                <td className="py-3 px-4 text-right text-on-surface">-2.4%</td>
                <td className="py-3 px-4 text-center text-[#059669]">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </td>
              </tr>
              <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                <td className="py-3 px-4 text-on-surface group-hover:text-primary transition-colors">Independent Audit (PwC)</td>
                <td className="py-3 px-4 text-on-surface-variant">Export Volume (TEU)</td>
                <td className="py-3 px-4 text-right text-on-surface">450k</td>
                <td className="py-3 px-4 text-center text-[#d97706]">
                  <span className="material-symbols-outlined text-[18px]">pending</span>
                </td>
              </tr>
              <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                <td className="py-3 px-4 text-on-surface group-hover:text-primary transition-colors">State Media Broadcast</td>
                <td className="py-3 px-4 text-on-surface-variant">Production Target</td>
                <td className="py-3 px-4 text-right text-on-surface">1.2M</td>
                <td className="py-3 px-4 text-center text-[#dc2626]">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
