export class ApiClient {
  private static getToken() {
    return localStorage.getItem("paperback_token");
  }

  private static getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  static async get<T>(url: string, options?: { timeoutMs?: number }): Promise<T> {
    const timeoutMs = options?.timeoutMs ?? 120000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { headers: this.getHeaders(), signal: controller.signal });
      if (!res.ok) throw new Error(`Failed to fetch ${url}`);
      return res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  static async post<T>(url: string, data: any, options?: { timeoutMs?: number }): Promise<T> {
    const timeoutMs = options?.timeoutMs ?? 120000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Failed to post ${url}`);
      return res.json();
    } finally {
      clearTimeout(timer);
    }
  }
}