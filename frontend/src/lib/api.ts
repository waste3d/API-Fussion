export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export type SourceName = "github" | "hackernews" | "rss";

export type SearchItem = {
  source: SourceName | string;
  title: string;
  url: string;
  snippet: string | null;
  score: number | null;
  timestamp: string | null;
};

export type SearchError = {
  source: string;
  message: string;
  type: string;
};

export type SearchResponse = {
  query: string;
  sources: string[];
  items: SearchItem[];
  errors: SearchError[];
  took_ms?: number | null;
};

export type SourceStatus = {
  source: string;
  ok: boolean;
  last_checked_at: string;
  latency_ms: number;
  error: string | null;
};

export type LogRow = {
  id: number;
  ts: string;
  request_id: string;
  q: string | null;
  sources: string[];
  took_ms: number | null;
  items_count: number;
  errors_count: number;
};

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<{ data: T; headers: Headers }> {
  const res = await fetch(`${API_URL}${path}`, { signal });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
  }
  const data = (await res.json()) as T;
  return { data, headers: res.headers };
}

// ====== Конкретные методы (чтобы в компонентах было чище) ======

export async function getSources(signal?: AbortSignal): Promise<SourceStatus[]> {
  const { data } = await apiGet<SourceStatus[]>("/v1/sources", signal);
  return data;
}

export async function getLogs(limit = 50, signal?: AbortSignal): Promise<LogRow[]> {
  const { data } = await apiGet<LogRow[]>(`/v1/logs?limit=${limit}`, signal);
  return data;
}

export async function search(
  q: string,
  sources: SourceName[],
  limit: number,
  signal?: AbortSignal
): Promise<{ data: SearchResponse; headers: Headers }> {
  const params = new URLSearchParams();
  params.set("q", q);
  params.set("limit", String(limit));
  sources.forEach((s) => params.append("sources", s));

  return apiGet<SearchResponse>(`/v1/search?${params.toString()}`, signal);
}