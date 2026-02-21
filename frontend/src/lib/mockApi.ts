import type { SearchResponse, SourceName } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockSearch(q: string, sources: SourceName[], limit = 20): Promise<SearchResponse> {
  await sleep(350);
  const now = new Date().toISOString();

  const all = [
    {
      source: "github" as const,
      title: `Example repo about ${q}`,
      url: "https://github.com/example/repo",
      snippet: "Mock result. Скоро подключим настоящий backend.",
      score: 1234,
      timestamp: now,
    },
    {
      source: "hackernews" as const,
      title: `HN discussion: ${q}`,
      url: "https://news.ycombinator.com/item?id=1",
      snippet: "Mock result. Скоро подключим настоящий backend.",
      score: 256,
      timestamp: now,
    },
  ];

  const items = all.filter((it) => sources.includes(it.source)).slice(0, limit);
  const errors =
    sources.includes("rss")
      ? [{ source: "rss" as const, message: "RSS источник пока не реализован", type: "source_error" }]
      : [];

  return { query: q, sources, items, errors };
}

export type SourceStatus = {
  source: SourceName;
  ok: boolean;
  latency_ms?: number | null;
  last_checked_at: string;
  error?: string | null;
};

export async function mockSources(): Promise<SourceStatus[]> {
  await sleep(250);
  const now = new Date().toISOString();
  return [
    { source: "github", ok: true, latency_ms: 120, last_checked_at: now },
    { source: "hackernews", ok: true, latency_ms: 80, last_checked_at: now },
    { source: "rss", ok: true, latency_ms: 40, last_checked_at: now },
  ];
}

export type LogRow = {
  id: string;
  ts: string;
  q: string;
  sources: SourceName[];
  took_ms: number;
  items: number;
  errors: number;
};

export async function mockLogs(): Promise<LogRow[]> {
  await sleep(250);
  const now = Date.now();
  return Array.from({ length: 8 }).map((_, i) => ({
    id: `log_${i}`,
    ts: new Date(now - i * 60_000).toISOString(),
    q: ["fastapi", "python", "vue", "react"][i % 4],
    sources: i % 2 === 0 ? (["github", "hackernews"] as SourceName[]) : (["rss"] as SourceName[]),
    took_ms: 120 + i * 18,
    items: 12 - i,
    errors: i % 3 === 0 ? 1 : 0,
  }));
}