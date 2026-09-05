// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NewsService } from '../services/news.service';
import { NewsStory } from '../types';
import { decodeHtmlEntities } from '../utils/decode';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export const TopicDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // In a real app we'd fetch topic metadata, here we mock it based on id
  const topicName = id ? id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Topic Overview';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all stories for this topic
        // Fallback to all stories if we don't have a real endpoint for topic filtering
        const allStories = await NewsService.getStories();
        // Just mock a subset for the topic if we can't filter server-side
        setStories(allStories.slice(0, 3)); 
      } catch (err) {
        console.error("Error fetching topic data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const chartData = {
    labels: Array.from({length: 30}, (_, i) => `Day ${i+1}`),
    datasets: [{
      label: 'Article Volume',
      data: [120, 135, 125, 140, 160, 155, 170, 190, 185, 210, 230, 220, 240, 260, 250, 280, 275, 300, 310, 290, 320, 340, 330, 350, 370, 360, 390, 410, 400, 420],
      borderColor: '#3525cd',
      backgroundColor: 'rgba(53, 37, 205, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#0b1c30',
      }
    },
    scales: {
      x: { display: false, grid: { display: false } },
      y: { 
        beginAtZero: true, 
        grid: { color: '#e2e8f0', drawBorder: false },
        ticks: { color: '#5f5e5e' }
      }
    },
    interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false }
  };

  return (
    <div className="flex flex-1 overflow-hidden w-full max-w-[1440px] mx-auto min-h-screen">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-full py-6 px-4 bg-surface-container-low border-r border-outline-variant w-80 sticky top-[73px]">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full border border-outline-variant bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">data_exploration</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Contextual Intelligence</h2>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">Verified Paperback Data</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2 font-body-md text-body-md">
          <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-DEFAULT text-left">
            <span className="material-symbols-outlined">map</span> Map Overview
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-on-primary-fixed-variant bg-primary-fixed font-bold rounded-DEFAULT text-left">
            <span className="material-symbols-outlined">analytics</span> Regional Data
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-DEFAULT text-left">
            <span className="material-symbols-outlined">person_search</span> Entity Profiles
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-DEFAULT text-left">
            <span className="material-symbols-outlined">history</span> Timeline
          </button>
        </nav>
        
        <div className="mt-auto pt-6">
          <button className="w-full py-3 px-4 bg-on-surface text-surface border border-on-surface font-label-caps text-label-caps uppercase tracking-wider hover:bg-primary transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span> Export Report
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-editorial-stack">
        {/* Topic Header */}
        <header className="mb-editorial-stack pb-8 border-b border-outline-variant">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-label-caps text-label-caps text-secondary px-2 py-1 bg-surface-container-high rounded-sm">TOPIC INTELLIGENCE</span>
            <span className="material-symbols-outlined text-secondary text-[16px]">chevron_right</span>
            <span className="font-label-caps text-label-caps text-primary px-2 py-1 bg-primary-container text-on-primary-container rounded-sm">MACROECONOMICS</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-4">{topicName}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
            Comprehensive coverage analysis tracking the narrative evolution, key entities, and publication distribution regarding India's macroeconomic indicators, policy shifts, and market sentiment.
          </p>
        </header>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
          {/* Center Column: Main Charts & Narrative */}
          <div className="xl:col-span-8 flex flex-col gap-editorial-stack">
            
            {/* Volume Over Time */}
            <section>
              <div className="flex justify-between items-end mb-4 border-t border-on-surface pt-4">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Coverage Volume</h3>
                  <p className="font-body-md text-body-md text-secondary">Rolling 30-day article mentions across verified publishers.</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm border border-outline-variant bg-surface hover:bg-surface-container-highest transition-colors font-data-mono">1M</button>
                  <button className="px-3 py-1 text-sm border border-primary bg-primary-container text-primary font-bold font-data-mono">3M</button>
                  <button className="px-3 py-1 text-sm border border-outline-variant bg-surface hover:bg-surface-container-highest transition-colors font-data-mono">YTD</button>
                </div>
              </div>
              <div className="bg-surface-bright border border-outline-variant p-4 h-[300px] w-full relative">
                <Line data={chartData} options={chartOptions} />
              </div>
            </section>

            {/* Narrative Evolution Timeline */}
            <section>
              <div className="border-t border-on-surface pt-4 mb-6">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-1">Narrative Evolution</h3>
                <p className="font-body-md text-body-md text-secondary">Key structural themes emerging in coverage.</p>
              </div>
              
              <div className="relative border-l border-outline-variant ml-4 space-y-8 pb-4">
                <div className="relative pl-6">
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-surface"></span>
                  <div className="font-data-mono text-data-mono text-primary mb-1">Oct 12 - Present</div>
                  <h4 className="font-headline-sm text-headline-sm mb-2">Q3 Growth Resilience</h4>
                  <div className="p-4 bg-surface-container-low border border-outline-variant">
                    <p className="font-body-md text-body-md mb-3">Shift from inflation concerns to robust domestic consumption narratives following better-than-expected retail numbers.</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-surface-container-highest text-xs font-label-caps">DOMESTIC DEMAND</span>
                      <span className="px-2 py-1 bg-surface-container-highest text-xs font-label-caps">RBI POLICY</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative pl-6">
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-outline ring-4 ring-surface"></span>
                  <div className="font-data-mono text-data-mono text-secondary mb-1">Sep 01 - Oct 11</div>
                  <h4 className="font-headline-sm text-headline-sm mb-2">FDI Inflow Moderation</h4>
                  <div className="p-4 bg-surface-container-low border border-outline-variant">
                    <p className="font-body-md text-body-md">Sustained focus on global headwinds affecting capital flows, with contrasting optimism regarding localized manufacturing setups.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Top Stories Bento */}
            <section>
              <div className="border-t border-on-surface pt-4 mb-6">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-1">Definitive Coverage</h3>
                <p className="font-body-md text-body-md text-secondary">Highest impact verified stories.</p>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-intelligence-gap animate-pulse">
                  <div className="md:col-span-2 h-64 bg-gray-200 border border-outline-variant w-full"></div>
                  <div className="h-48 bg-gray-200 border border-outline-variant w-full"></div>
                  <div className="h-48 bg-gray-200 border border-outline-variant w-full"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-intelligence-gap">
                  {stories.length > 0 && (
                    <Link to={`/story/${stories[0].id}`} className="md:col-span-2 group cursor-pointer">
                      <div className="relative h-64 w-full bg-surface-container-highest border border-outline-variant overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent flex flex-col justify-end p-6 z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-primary text-surface text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                              {stories[0].category || 'Intelligence'}
                            </span>
                          </div>
                          <h4 className="font-headline-md text-headline-md text-surface">{decodeHtmlEntities(stories[0].title)}</h4>
                        </div>
                      </div>
                    </Link>
                  )}
                  
                  {stories.slice(1, 3).map(story => (
                    <Link to={`/story/${story.id}`} key={story.id} className="group cursor-pointer bg-surface-bright border border-outline-variant p-4 hover:border-primary transition-colors flex flex-col justify-between h-48">
                      <div>
                        <div className="text-xs font-data-mono text-secondary mb-2">{new Date(story.publishDate).toLocaleDateString()}</div>
                        <h4 className="font-headline-sm text-headline-sm leading-snug line-clamp-3">{decodeHtmlEntities(story.title)}</h4>
                      </div>
                      <div className="w-full h-1 bg-surface-container-highest mt-4">
                        <div className="h-full bg-primary" style={{width: `${Math.random() * 50 + 25}%`}}></div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Entities & Distribution */}
          <div className="xl:col-span-4 flex flex-col gap-editorial-stack">
            {/* Major Entities */}
            <section className="bg-surface-bright border border-outline-variant">
              <div className="p-4 border-b border-outline-variant bg-surface-container-lowest">
                <h3 className="font-headline-sm text-headline-sm">Key Entities</h3>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-container-high rounded-full flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">account_balance</span>
                    </div>
                    <div>
                      <div className="font-body-md font-semibold text-on-surface">Reserve Bank of India</div>
                      <div className="text-xs text-secondary font-data-mono">Institution</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-data-mono text-on-surface">1,245</div>
                    <div className="text-[10px] text-emerald-600 font-data-mono">+12%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border-b border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-container-high rounded-full flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                    <div>
                      <div className="font-body-md font-semibold text-on-surface">Shaktikanta Das</div>
                      <div className="text-xs text-secondary font-data-mono">Individual</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-data-mono text-on-surface">892</div>
                    <div className="text-[10px] text-emerald-600 font-data-mono">+5%</div>
                  </div>
                </div>
              </div>
              <div className="p-3 border-t border-outline-variant text-center bg-surface-container-lowest">
                <button className="text-xs font-label-caps text-primary hover:underline">VIEW ALL ENTITIES</button>
              </div>
            </section>

            {/* Publication Distribution */}
            <section className="bg-surface-bright border border-outline-variant">
              <div className="p-4 border-b border-outline-variant bg-surface-container-lowest">
                <h3 className="font-headline-sm text-headline-sm">Publisher Distribution</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-body-md">The Economic Times</span>
                    <span className="font-data-mono">28%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high">
                    <div className="h-full bg-primary" style={{ width: '28%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-body-md">Mint</span>
                    <span className="font-data-mono">22%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high">
                    <div className="h-full bg-primary opacity-80" style={{ width: '22%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-body-md">Business Standard</span>
                    <span className="font-data-mono">18%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high">
                    <div className="h-full bg-primary opacity-60" style={{ width: '18%' }}></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
