import { useState, useEffect, useCallback } from 'react';

const QUOTA_LIMIT = 99999; // Increased for development
const STORAGE_KEY = 'paperback_read_quota';

interface QuotaData {
  date: string;
  storyIds: string[];
}

export function useReadQuota() {
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [readsRemaining, setReadsRemaining] = useState(QUOTA_LIMIT);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(STORAGE_KEY);
    let data: QuotaData = { date: today, storyIds: [] };

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as QuotaData;
        if (parsed.date === today) {
          data = parsed;
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }

    setReadsRemaining(Math.max(0, QUOTA_LIMIT - data.storyIds.length));
    if (data.storyIds.length >= QUOTA_LIMIT) {
      setIsQuotaExceeded(true);
    }
  }, []);

  const trackRead = useCallback((storyId: string) => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(STORAGE_KEY);
    let data: QuotaData = { date: today, storyIds: [] };

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as QuotaData;
        if (parsed.date === today) {
          data = parsed;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!data.storyIds.includes(storyId)) {
      data.storyIds.push(storyId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setReadsRemaining(Math.max(0, QUOTA_LIMIT - data.storyIds.length));
      
      if (data.storyIds.length > QUOTA_LIMIT) {
        setIsQuotaExceeded(true);
      }
    } else {
        if (data.storyIds.length > QUOTA_LIMIT) {
            setIsQuotaExceeded(true);
        }
    }
  }, []);

  return { isQuotaExceeded, readsRemaining, trackRead };
}
