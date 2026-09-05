/**
 * In-house Node NLP surface for The Paperback.
 * Dense embed (MiniLM with hashed TF-IDF fallback), heuristic entities, language, tokenize.
 */
export { embedHeadline as embed } from "../services/embed.minilm";
export { extractEntitiesDetailed as entities } from "../services/nlp/entity.service";
export { detectLanguage as language } from "../services/nlp/language.service";
export { tokenize } from "../services/clustering.service";
