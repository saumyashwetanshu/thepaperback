import type { NewsStory } from "../types";

interface TopicFrequency {
  topic: string;
  count: number;
  weight: number;
}

interface TrendingTopic {
  topic: string;
  score: number;
  storyCount: number;
  recentBoost: number;
}

/**
 * Calculate trending topics from recent stories
 * Uses a combination of frequency and recency weighting
 */
function calculateTrendingTopics(
  stories: NewsStory[],
  options: {
    timeWindowHours?: number;
    maxTopics?: number;
    minFrequency?: number;
  } = {}
): TrendingTopic[] {
  const {
    timeWindowHours = 24, // Look at last 24 hours by default
    maxTopics = 10,
    minFrequency = 2
  } = options;

  const now = Date.now();
  const timeWindowMs = timeWindowHours * 60 * 60 * 1000;

  // Filter stories within time window
  const recentStories = stories.filter(story => {
    const storyTime = story.timestamp
      ? new Date(story.timestamp).getTime()
      : new Date(story.date).getTime();
    return now - storyTime <= timeWindowMs;
  });

  // Count topic frequencies
  const topicCounts = new Map<string, number>();
  const topicStories = new Map<string, NewsStory[]>();

  recentStories.forEach(story => {
    if (story.entities?.topics) {
      story.entities.topics.forEach(topic => {
        const count = topicCounts.get(topic) || 0;
        topicCounts.set(topic, count + 1);

        const storiesForTopic = topicStories.get(topic) || [];
        topicStories.set(topic, [...storiesForTopic, story]);
      });
    }
  });

  // Calculate trending scores
  const trendingTopics: TrendingTopic[] = [];

  topicCounts.forEach((count, topic) => {
    if (count >= minFrequency) {
      const storiesForTopic = topicStories.get(topic) || [];

      // Calculate recency boost (more recent stories get higher weight)
      const recencyBoost = storiesForTopic.reduce((boost, story) => {
        const storyTime = story.timestamp
          ? new Date(story.timestamp).getTime()
          : new Date(story.date).getTime();
        const hoursAgo = (now - storyTime) / (1000 * 60 * 60);
        // More recent = higher boost (max 1.0 for stories from last hour)
        return boost + Math.max(0, 1 - (hoursAgo / timeWindowHours));
      }, 0);

      // Normalize recency boost
      const normalizedRecencyBoost = recencyBoost / Math.max(1, storiesForTopic.length);

      // Base score is frequency, boosted by recency
      const score = count * (1 + normalizedRecencyBoost * 0.5); // Up to 50% boost for recency

      trendingTopics.push({
        topic,
        score,
        storyCount: count,
        recentBoost: normalizedRecencyBoost
      });
    }
  });

  // Sort by score descending
  return trendingTopics
    .sort((a, b) => b.score - a.score)
    .slice(0, maxTopics);
}

/**
 * Get trending topics for display in sidebar
 */
export function getTrendingTopicsForDisplay(
  stories: NewsStory[],
  options: {
    timeWindowHours?: number;
    maxTopics?: number;
    minFrequency?: number;
  } = {}
) {
  const trending = calculateTrendingTopics(stories, options);

  return trending.map((topic, index) => ({
    ...topic,
    rank: index + 1,
    // Generate a display-friendly label
    label: topic.topic
      .split(/(?=[A-Z])/) // Split on capital letters
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
  }));
}