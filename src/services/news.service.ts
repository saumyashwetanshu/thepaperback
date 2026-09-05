import { ApiClient } from "./api.client";
import { NewsStory, LiveWireItem, FollowUpCase, NewsFeedResponse } from "../types";

export interface StoryDetailResponse {
  success: boolean;
  story: NewsStory;
}

function normalizeWireStatus(status: string | undefined): LiveWireItem["status"] {
  if (status === "Verified") return "Indexed";
  if (status === "Breaking" || status === "Developing" || status === "Indexed") return status;
  return "Indexed";
}

function normalizeFeed(raw: any): NewsFeedResponse {
  const data = raw && typeof raw === "object" ? raw : {};
  const wire = Array.isArray(data.wire)
    ? data.wire.map((item: any) => ({
        ...item,
        status: normalizeWireStatus(item?.status),
      }))
    : [];

  return {
    success: data.success !== false,
    query: typeof data.query === "string" ? data.query : undefined,
    leadStory: data.leadStory || undefined,
    trendingRail: Array.isArray(data.trendingRail) ? data.trendingRail : [],
    todaysEssentials: Array.isArray(data.todaysEssentials) ? data.todaysEssentials : [],
    coverageDiffers: Array.isArray(data.coverageDiffers) ? data.coverageDiffers : [],
    voicesOfIndia: Array.isArray(data.voicesOfIndia) ? data.voicesOfIndia : [],
    otherDevelopments: Array.isArray(data.otherDevelopments) ? data.otherDevelopments : [],
    wire,
    ...(Array.isArray(data.stories) && data.stories.length > 0 ? { stories: data.stories } : {}),
    pagination: data.pagination || { page: 1, limit: 20, total: 0 },
  };
}

export class NewsService {
  static async getStories(page = 1, limit = 20): Promise<NewsFeedResponse> {
    try {
      const res = await ApiClient.get<any>(`/api/news?page=${page}&limit=${limit}`);
      return normalizeFeed(res);
    } catch (err) {
      console.warn("[NewsService.getStories] feed fetch failed:", err);
      return {
        success: false,
        leadStory: undefined,
        trendingRail: [],
        todaysEssentials: [],
        coverageDiffers: [],
        voicesOfIndia: [],
        otherDevelopments: [],
        wire: [],
        pagination: { page, limit, total: 0 },
      };
    }
  }

  static async getStoryById(id: string): Promise<NewsStory> {
    const res = await ApiClient.get<StoryDetailResponse>(`/api/news/${id}`, { timeoutMs: 120000 });
    return res.story;
  }

  static async search(query: string, limit = 20): Promise<NewsFeedResponse> {
    try {
      const res = await ApiClient.get<any>(`/api/news?q=${encodeURIComponent(query)}&limit=${limit}`);
      return normalizeFeed(res);
    } catch (err) {
      console.warn("[NewsService.search] failed:", err);
      return {
        success: false,
        query,
        stories: [],
        wire: [],
        pagination: { page: 1, limit, total: 0 },
      };
    }
  }

  static async getVoicesOfIndia(): Promise<any> {
    return ApiClient.get<any>(`/api/news/voices-of-india`);
  }

  static async getLiveFactChecks(): Promise<any> {
    return ApiClient.get<any>(`/api/news/fact-check/live`);
  }

  static async postFactCheck(claim: string): Promise<any> {
    return ApiClient.post<any>('/api/news/fact-check', { claim });
  }
}
