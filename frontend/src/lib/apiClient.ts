import { mockSearch } from "./mockApi";
import type { SearchResponse, SourceName } from "./types";

const API_MODE = import.meta.env.VITE_API_MODE;
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function realSearch(
  q: string,
  sources: SourceName[],
  limit = 20
): Promise<SearchResponse> {
  const params = new URLSearchParams();

  params.set("q", q);
  params.set("limit", String(limit));
  sources.forEach((s) => params.append("sources", s));

  const res = await fetch(`${BASE_URL}/v1/search?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export async function search(
  q: string,
  sources: SourceName[],
  limit = 20
): Promise<SearchResponse> {
  if (API_MODE === "mock") {
    return mockSearch(q, sources, limit);
  }

  return realSearch(q, sources, limit);
}