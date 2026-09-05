import React from 'react';
import type { NewsStory } from '../../types';

export function EntityGraph({ story }: { story: NewsStory }) {
  if (!story.entities) {
    return (
      <section className="py-8">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Entity Map</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">Analysis pending. No entities extracted.</p>
      </section>
    );
  }
  
  const { people = [], institutions = [], topics = [] } = story.entities;
  
  if (people.length === 0 && institutions.length === 0 && topics.length === 0) {
      return null;
  }
  
  return (
    <section className="py-8 border-t border-outline-variant">
      <header className="mb-8">
        <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Entity Map</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Key people, organizations, and concepts associated with this story.</p>
      </header>
      
      <div className="flex flex-wrap gap-4">
        {people.map(person => (
          <div key={person} className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant rounded-none">
            <span className="w-2 h-2 rounded-full bg-surface-tint"></span>
            <span className="font-data-mono text-data-mono text-sm">{person}</span>
          </div>
        ))}
        {institutions.map(inst => (
          <div key={inst} className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant rounded-none">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            <span className="font-data-mono text-data-mono text-sm">{inst}</span>
          </div>
        ))}
        {topics.map(topic => (
          <div key={topic} className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant rounded-none">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-data-mono text-data-mono text-sm">{topic}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
