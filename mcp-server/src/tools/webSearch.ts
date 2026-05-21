import axios from "axios";
import { cache } from "../services/cache";

const SERPER_URL = "https://google.serper.dev/search";
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
export type SearchResult = {
  title: string;
  link: string;
  snippet: string;
};

type SerperResponse = {
  organic?: Array<{
    title?: string;
    link?: string;
    snippet?: string;
  }>;
};

export const webSearch = async (query: string, limit = 5): Promise<SearchResult[]> => {
  const trimmedQuery = query.trim();
  const cacheKey = `search:${trimmedQuery}:${limit}`;
  const cached = cache.get<SearchResult[]>(cacheKey);

  if (cached) {
    return cached;
  }

  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is missing.");
  }

  const response = await axios.post<SerperResponse>(
    SERPER_URL,
    {
      q: trimmedQuery,
      num: limit
    },
    {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json"
      },
      timeout: 10000
    }
  );

  const results: SearchResult[] = (response.data.organic ?? [])
    .slice(0, limit)
    .map((item) => ({
      title: item.title ?? "Untitled",
      link: item.link ?? "",
      snippet: item.snippet ?? ""
    }))
    .filter((item) => Boolean(item.link));

  cache.set(cacheKey, results, SEARCH_CACHE_TTL_MS);
  return results;
};
