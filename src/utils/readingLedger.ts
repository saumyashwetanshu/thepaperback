import { NewsStory, Perspective } from "../types";

export interface ReadingLogEntry {
  id: string;
  storyId: string;
  title: string;
  category: string;
  source: string;
  bias: string;
  timestamp: number;
}

export interface UserPreferences {
  topics: string[];
  publications: string[];
}

const STORAGE_KEY = "paperback_reading_history";
const DIET_LEGACY_KEY = "paperback_diet";
const PREFERENCES_KEY = "paperback_user_preferences";

export function recordStoryRead(story: NewsStory): void {
  try {
    if (!story || !story.id) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    const history: ReadingLogEntry[] = raw ? JSON.parse(raw) : [];

    // Avoid duplicate rapid clicks on the same story within 5 minutes
    const recent = history.find(h => h.storyId === story.id && (Date.now() - h.timestamp < 5 * 60 * 1000));
    if (recent) return;

    const primaryPerspective = story.perspectives?.[0];
    const source = primaryPerspective?.source || story.institution || "National Bureau";
    const bias = primaryPerspective?.bias || "center";

    const entry: ReadingLogEntry = {
      id: `read-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      storyId: story.id,
      title: story.title,
      category: story.category || "National",
      source,
      bias,
      timestamp: Date.now()
    };

    history.unshift(entry);
    // Keep last 100 entries max to preserve local storage
    if (history.length > 100) history.length = 100;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    // Update legacy counter for backward compatibility
    const dietRaw = localStorage.getItem(DIET_LEGACY_KEY);
    const diet = dietRaw ? JSON.parse(dietRaw) : { left: 0, center: 0, right: 0 };
    if (bias.includes("left")) diet.left = (diet.left || 0) + 1;
    else if (bias.includes("right")) diet.right = (diet.right || 0) + 1;
    else diet.center = (diet.center || 0) + 1;
    localStorage.setItem(DIET_LEGACY_KEY, JSON.stringify(diet));
  } catch (err) {
    console.warn("Could not record story read event to localStorage:", err);
  }
}

export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.warn("Could not save user preferences to localStorage:", err);
  }
}

export function getUserPreferences(): UserPreferences | null {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Could not get user preferences from localStorage:", err);
    return null;
  }
}

export interface ReadingAnalytics {
  hasEnoughHistory: boolean;
  totalStoriesRead: number;
  totalReadingTimeFormatted: string;
  uniqueSourcesCount: number;
  topicsCount: number;
  spectrumBalance: {
    leftPct: number;
    centerPct: number;
    rightPct: number;
    regionalPct: number;
  };
  topSources: {
    name: string;
    reads: number;
    share: string;
    bias: string;
  }[];
  topicDistribution: {
    category: string;
    count: number;
    share: string;
  }[];
  blindspots: {
    beat: string;
    desc: string;
  }[];
  balanceScore: number;
}

export function getRecentStories(limit = 5): ReadingLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const allHistory: ReadingLogEntry[] = raw ? JSON.parse(raw) : [];

    // Sort by timestamp descending (most recent first)
    const sorted = allHistory.sort((a, b) => b.timestamp - a.timestamp);
    return sorted.slice(0, limit);
  } catch (err) {
    console.warn("Could not get recent stories:", err);
    return [];
  }
}

function getReadingAnalytics(timeRange: "7d" | "30d" | "90d" = "30d"): ReadingAnalytics {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const allHistory: ReadingLogEntry[] = raw ? JSON.parse(raw) : [];

    const now = Date.now();
    const daysLimit = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;
    const msLimit = daysLimit * 24 * 60 * 60 * 1000;

    const history = allHistory.filter(h => now - h.timestamp <= msLimit);

    if (history.length === 0) {
      return {
        hasEnoughHistory: false,
        totalStoriesRead: 0,
        totalReadingTimeFormatted: "0m",
        uniqueSourcesCount: 0,
        topicsCount: 0,
        spectrumBalance: { leftPct: 0, centerPct: 0, rightPct: 0, regionalPct: 0 },
        topSources: [],
        topicDistribution: [],
        blindspots: [
          { beat: "Courts, Law & Constitution", desc: "Start exploring legal rulings and judicial cause lists." },
          { beat: "Economy, Markets & Business", desc: "Track RBI monetary actions and fiscal developments." },
          { beat: "Science, Climate & Tech", desc: "Follow grassroots agrarian and environmental investigations." },
          { beat: "States & Regions", desc: "Read independent dispatches from state bureaus." }
        ],
        balanceScore: 0
      };
    }

    const totalRead = history.length;
    const estimatedMinutes = totalRead * 3; // Approx 3 mins per story brief
    const hours = Math.floor(estimatedMinutes / 60);
    const mins = estimatedMinutes % 60;
    const totalReadingTimeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    // 1. Source Frequency
    const sourceCounts = new Map<string, { count: number; bias: string }>();
    for (const h of history) {
      const cur = sourceCounts.get(h.source) || { count: 0, bias: h.bias };
      cur.count++;
      sourceCounts.set(h.source, cur);
    }

    const sortedSources = Array.from(sourceCounts.entries())
      .map(([name, val]) => ({
        name,
        reads: val.count,
        share: `${Math.round((val.count / totalRead) * 100)}%`,
        bias: val.bias
      }))
      .sort((a, b) => b.reads - a.reads);

    // 2. Political Spectrum
    let leftCount = 0;
    let centerCount = 0;
    let rightCount = 0;
    let regionalCount = 0;

    for (const h of history) {
      const b = (h.bias || "").toLowerCase();
      if (b.includes("left")) leftCount++;
      else if (b.includes("right")) rightCount++;
      else if (b.includes("regional") || b.includes("independent")) regionalCount++;
      else centerCount++;
    }

    const leftPct = Math.round((leftCount / totalRead) * 100);
    const rightPct = Math.round((rightCount / totalRead) * 100);
    const regionalPct = Math.round((regionalCount / totalRead) * 100);
    const centerPct = Math.max(0, 100 - leftPct - rightPct - regionalPct);

    // 3. Topic Distribution
    const categoryCounts = new Map<string, number>();
    for (const h of history) {
      const cat = h.category || "National";
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    }

    const sortedTopics = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({
        category,
        count,
        share: `${Math.round((count / totalRead) * 100)}%`
      }))
      .sort((a, b) => b.count - a.count);

    // 4. Dynamic Blind Spots (Unread or low-read beats)
    const allKnownBeats = [
      { beat: "Courts, Law & Constitution", category: "Courts, Law & Constitution", desc: "Judicial cause lists and constitutional bench hearings." },
      { beat: "Economy, Markets & Business", category: "Economy, Markets & Business", desc: "RBI policy, trade figures, and fiscal telemetry." },
      { beat: "Science, Climate & Tech", category: "Science, Climate & Tech", desc: "Ecological compliance and forest governance." },
      { beat: "States & Regions", category: "States & Regions", desc: "Independent state reporting from Northeast and Southern bureaus." }
    ];

    const detectedBlindspots = allKnownBeats
      .filter(b => !categoryCounts.has(b.category) || (categoryCounts.get(b.category) || 0) < 2)
      .slice(0, 4);

    // 5. Balance Score Calculation (0 - 100)
    // Optimal is a balance of center, left, right and regional sources
    const diversityPenalty = Math.abs(leftPct - rightPct);
    const baseScore = Math.min(100, Math.max(40, 80 - Math.floor(diversityPenalty / 2) + Math.min(20, sourceCounts.size * 3)));

    return {
      hasEnoughHistory: true,
      totalStoriesRead: totalRead,
      totalReadingTimeFormatted,
      uniqueSourcesCount: sourceCounts.size,
      topicsCount: categoryCounts.size,
      spectrumBalance: {
        leftPct,
        centerPct,
        rightPct,
        regionalPct
      },
      topSources: sortedSources.slice(0, 6),
      topicDistribution: sortedTopics.slice(0, 4),
      blindspots: detectedBlindspots.length > 0 ? detectedBlindspots : allKnownBeats,
      balanceScore: baseScore
    };
  } catch (err) {
    console.warn("Could not compute reading analytics:", err);
    return {
      hasEnoughHistory: false,
      totalStoriesRead: 0,
      totalReadingTimeFormatted: "0m",
      uniqueSourcesCount: 0,
      topicsCount: 0,
      spectrumBalance: { leftPct: 0, centerPct: 0, rightPct: 0, regionalPct: 0 },
      topSources: [],
      topicDistribution: [],
      blindspots: [],
      balanceScore: 0
    };
  }
}
