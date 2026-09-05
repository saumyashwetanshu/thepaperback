import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUserPreferences, getUserPreferences } from '../utils/readingLedger';

const TOPICS = [
  "Politics & Governance",
  "Economy, Markets & Business",
  "States & Regions",
  "Courts, Law & Constitution",
  "International & Strategy",
  "Science, Climate & Tech",
  "Society, Health & Culture"
];

const PUBLICATIONS = [
  'The Hindu', 'Indian Express', 'NDTV', 'Times of India',
  'Hindustan Times', 'India Today', 'The Print', 'News18',
  'Economic Times', 'Business Standard', 'Deccan Herald', 'Scroll'
];

export const Personalize = () => {
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedPubs, setSelectedPubs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const savedPrefs = getUserPreferences();
    if (savedPrefs) {
      setSelectedTopics(savedPrefs.topics || []);
      setSelectedPubs(savedPrefs.publications || []);
    }
  }, []);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const togglePub = (pub: string) => {
    setSelectedPubs(prev =>
      prev.includes(pub) ? prev.filter(p => p !== pub) : [...prev, pub]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTopics.length < 3) {
      alert("Please select at least 3 topics.");
      return;
    }

    setLoading(true);
    // Save preferences
    saveUserPreferences({
      topics: selectedTopics,
      publications: selectedPubs
    });

    // Navigate home after a brief delay to show success
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-editorial-stack w-full max-w-[1024px] mx-auto">
        <header className="text-center mb-editorial-stack w-full max-w-2xl">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-gutter">Personalise Your News</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">We'll build your news intelligence around what you care about.</p>
        </header>

        <form className="w-full space-y-editorial-stack" onSubmit={handleSubmit}>
          {/* Topics Section */}
          <section>
            <div className="flex items-center justify-between border-b border-outline-variant pb-unit mb-gutter">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Topics</h2>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Select at least 3</span>
            </div>
            <div className="flex flex-wrap gap-intelligence-gap">
              {TOPICS.map(topic => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <label key={topic} className="cursor-pointer">
                    <input
                      className="sr-only"
                      type="checkbox"
                      value={topic}
                      checked={isSelected}
                      onChange={() => toggleTopic(topic)}
                    />
                    <span className={`inline-block px-4 py-2 border border-outline-variant transition-colors duration-200 select-none font-body-md text-body-md rounded-none ${isSelected ? 'bg-on-surface text-surface border-on-surface' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'}`}>
                      {topic}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Publications Section */}
          <section>
            <div className="flex items-center justify-between border-b border-outline-variant pb-unit mb-gutter">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Publications</h2>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Optional</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-intelligence-gap">
              {PUBLICATIONS.map(pub => {
                const isSelected = selectedPubs.includes(pub);
                return (
                  <label key={pub} className="cursor-pointer h-full">
                    <input
                      className="sr-only"
                      type="checkbox"
                      value={pub}
                      checked={isSelected}
                      onChange={() => togglePub(pub)}
                    />
                    <div className={`h-full border border-outline-variant transition-colors duration-200 p-4 flex items-center justify-center text-center font-headline-sm text-headline-sm rounded-none ${isSelected ? 'bg-on-surface text-surface border-on-surface' : 'bg-surface-container-lowest hover:bg-surface-container-low text-on-surface'}`}>
                      {pub}
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          <div className="pt-editorial-stack flex justify-end border-t border-outline-variant">
            <button
              className={`${loading ? 'bg-gray-400 text-gray-600' : 'bg-on-surface text-surface'} px-8 py-3 font-label-caps text-label-caps tracking-wider uppercase hover:bg-on-surface-variant transition-colors rounded-none`}
              disabled={selectedTopics.length < 3 || loading}
              type="submit"
            >
              {loading ? 'Saving...' : 'Get Started'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
