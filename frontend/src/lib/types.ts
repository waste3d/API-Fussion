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