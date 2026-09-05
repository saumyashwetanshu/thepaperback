// Facade: ingest + scrape live on this path.
export {
    getLiveNews,
    searchLiveNews,
    liveFactCheckClaim,
    ai
} from "./ingestion.service";
export { getGeminiClient, getGeminiApiKey } from "./secrets.service";

