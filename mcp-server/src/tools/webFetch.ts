import axios from "axios";
import * as cheerio from "cheerio";
import { cache } from "../services/cache";
import { cleanHtml, limitTextSize } from "../utils/cleanHtml";

const FETCH_CACHE_TTL_MS = 10 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;
const MAX_TEXT_LENGTH = 12000;

export const webFetch = async (url: string): Promise<string> => {
  const normalizedUrl = url.trim();
  const cacheKey = `fetch:${normalizedUrl}`;
  const cached = cache.get<string>(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await axios.get<string>(normalizedUrl, {
    timeout: FETCH_TIMEOUT_MS,
    responseType: "text",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    }
  });

  const $ = cheerio.load(response.data);
  $("script, style, noscript, iframe, svg").remove();
  const sanitizedHtml = $.html();
  const cleanedText = cleanHtml(sanitizedHtml);
  const text = limitTextSize(cleanedText, MAX_TEXT_LENGTH);

  cache.set(cacheKey, text, FETCH_CACHE_TTL_MS);
  return text;
};
