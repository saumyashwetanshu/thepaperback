import React from 'react';
import { NEWS_SOURCES } from '../server/services/ingestion/sources';

const RSS_DESKS = NEWS_SOURCES
  .filter((s) => s.type === 'rss')
  .filter((s, i, arr) => arr.findIndex((x) => x.name === s.name) === i)
  .map((s) => ({ name: s.name, region: s.region, feed: s.url }));

export const SourceDirectory = () => {
  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-editorial-stack">
      <main className="flex flex-col gap-editorial-stack">
        <section className="flex flex-col gap-6">
          <div className="max-w-[800px]">
            <h1 className="font-display-lg text-display-lg text-on-surface mb-4">Source Directory</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              RSS desks Paperback pulls. We do not rate outlets. Name, region, and feed URL only.
            </p>
          </div>
        </section>

        <section className="flex flex-col border-t border-outline-variant pt-6">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b-2 border-outline font-label-caps text-label-caps text-on-surface-variant">
                  <th className="pb-3 font-normal pr-4">Publication</th>
                  <th className="pb-3 font-normal px-4">Region</th>
                  <th className="pb-3 font-normal pl-4">Feed</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface">
                {RSS_DESKS.map(desk => (
                  <tr key={desk.feed} className="border-b border-outline-variant">
                    <td className="py-4 pr-4">
                      <span className="font-headline-sm text-headline-sm">{desk.name}</span>
                    </td>
                    <td className="py-4 px-4 text-on-surface-variant">{desk.region}</td>
                    <td className="py-4 pl-4">
                      <a href={desk.feed} className="text-on-surface-variant underline break-all" target="_blank" rel="noreferrer">
                        {desk.feed}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};
