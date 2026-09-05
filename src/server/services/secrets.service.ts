/**
 * Google Cloud Secret Manager Service for The Paperback.
 * 
 * Safely fetches secrets from Google Cloud Secret Manager when running in GCP,
 * with a clean local environment fallback.
 */

let cachedGeminiKey: string | null = null;

export async function getGeminiApiKey(): Promise<string> {
  // If already resolved in memory, return fast
  if (cachedGeminiKey) return cachedGeminiKey;

  // 1. Direct environment variable (standard Cloud Run secret mount: --set-secrets=GEMINI_API_KEY=...)
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("your-api-key")) {
    cachedGeminiKey = process.env.GEMINI_API_KEY;
    return cachedGeminiKey;
  }

  // 2. Dynamic Secret Manager retrieval if running with GCP credentials
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
  if (projectId) {
    try {
      // Dynamic import to keep startup light if Secret Manager client is present
      const { SecretManagerServiceClient } = await import("@google-cloud/secret-manager");
      const client = new SecretManagerServiceClient();
      const name = `projects/${projectId}/secrets/GEMINI_API_KEY/versions/latest`;
      const [version] = await client.accessSecretVersion({ name });
      const payload = version.payload?.data?.toString();
      if (payload) {
        console.log("[SecretManager] Successfully retrieved GEMINI_API_KEY from Google Cloud Secret Manager");
        cachedGeminiKey = payload;
        return cachedGeminiKey;
      }
    } catch (err: any) {
      console.warn("[SecretManager] Secret Manager retrieval skipped or failed:", err?.message || err);
    }
  }

  // 3. Fallback to process.env
  cachedGeminiKey = process.env.GEMINI_API_KEY || "";
  return cachedGeminiKey;
}

let cachedAiClient: any = null;

export async function getGeminiClient(): Promise<any> {
  if (cachedAiClient) return cachedAiClient;
  const key = await getGeminiApiKey();
  if (!key) return null;
  const { GoogleGenAI } = await import("@google/genai");
  cachedAiClient = new GoogleGenAI({ apiKey: key });
  return cachedAiClient;
}

