/** Miniflux-style feed health. In-memory; process lifetime. */

export interface FeedHealth {
  feedId: string;
  url: string;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastError: string | null;
  errorCount: number;
  consecutiveErrors: number;
}

export class FeedHealthBook {
  private rows = new Map<string, FeedHealth>();

  markOk(feedId: string, url: string, at = new Date().toISOString()): FeedHealth {
    const prev = this.rows.get(feedId);
    const row: FeedHealth = {
      feedId,
      url,
      lastSuccessAt: at,
      lastErrorAt: prev?.lastErrorAt ?? null,
      lastError: null,
      errorCount: prev?.errorCount ?? 0,
      consecutiveErrors: 0,
    };
    this.rows.set(feedId, row);
    return row;
  }

  markError(feedId: string, url: string, err: string, at = new Date().toISOString()): FeedHealth {
    const prev = this.rows.get(feedId);
    const row: FeedHealth = {
      feedId,
      url,
      lastSuccessAt: prev?.lastSuccessAt ?? null,
      lastErrorAt: at,
      lastError: err,
      errorCount: (prev?.errorCount ?? 0) + 1,
      consecutiveErrors: (prev?.consecutiveErrors ?? 0) + 1,
    };
    this.rows.set(feedId, row);
    return row;
  }

  get(feedId: string): FeedHealth | undefined {
    return this.rows.get(feedId);
  }

  list(): FeedHealth[] {
    return [...this.rows.values()];
  }
}

export const feedHealth = new FeedHealthBook();
