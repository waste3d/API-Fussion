export type SourceName = "github" | "hackernews" | "rss";

export type ErrorInfo = {
  source: SourceName;
  message: string;
  type?: string;
};

export type SearchItem = {
  source: SourceName;
  title: string;
  url: string;
  snippet?: string | null;
  score?: number | null;
  timestamp?: string | null;
};

export type SearchResponse = {
  query: string;
  sources: SourceName[];
  items: SearchItem[];
  errors: ErrorInfo[];
};

export type SourceStatus = {
  source: SourceName;
  ok: boolean;
  latency_ms?: number | null;
  last_checked_at: string;
  error?: string | null;
};

export type LogRow = {
  id: string;
  ts: string;
  q: string;
  sources: SourceName[];
  took_ms: number;
  items: number;
  errors: number;
};