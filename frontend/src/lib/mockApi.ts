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