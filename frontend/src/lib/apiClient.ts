import type { SearchResponse, SourceName } from "./types";
import { mockSearch, mockSources, mockLogs } from "./mockApi";

const MODE = (import.meta.env.VITE_API_MODE ?? "mock") as "mock" | "api";
const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function apiSearch(q: string, sources: SourceName[], limit = 20): Promise<SearchResponse> {
  const params = new URLSearchParams();
  params.set("q", q);
  params.set("limit", String(limit));
  sources.forEach((s) => params.append("sources", s));
  const res = await fetch(`${BASE}/v1/search?${params.toString()}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function search(q: string, sources: SourceName[], limit = 20) {
  return MODE === "mock" ? mockSearch(q, sources, limit) : apiSearch(q, sources, limit);
}

// Эти два пока моковые всегда (бэк потом добавим)
export async function getSources() {
  return mockSources();
}
export async function getLogs() {
  return mockLogs();
}