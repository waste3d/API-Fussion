import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { search } from "../lib/apiClient";
import type { SearchResponse, SourceName } from "../lib/types";

const SOURCES: { id: SourceName; label: string }[] = [
  { id: "github", label: "GitHub" },
  { id: "hackernews", label: "HackerNews" },
  { id: "rss", label: "RSS" },
];

export default function SearchPage() {
  const [q, setQ] = useState("python");
  const [sources, setSources] = useState<SourceName[]>([
    "github",
    "hackernews",
  ]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSearch = useMemo(
    () => q.trim().length > 0 && sources.length > 0,
    [q, sources]
  );

  function toggleSource(id: SourceName) {
    setSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function onSearch() {
    if (!canSearch) return;

    setLoading(true);
    setError(null);

    try {
      const res = await search(q.trim(), sources, 20);
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* SEARCH BOX */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Введите запрос…"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-700"
          />

          <button
            onClick={onSearch}
            disabled={!canSearch || loading}
            className="rounded-xl bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-950 transition disabled:opacity-50"
          >
            {loading ? "Поиск..." : "Искать"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SOURCES.map((s) => {
            const active = sources.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleSource(s.id)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs transition",
                  active
                    ? "border border-zinc-700 bg-zinc-900 text-zinc-100"
                    : "border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200",
                ].join(" ")}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* RESULTS */}
      <AnimatePresence mode="popLayout">
        {data && (
          <motion.section
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="grid gap-4"
          >
            {/* source errors */}
            {data.errors.length > 0 && (
              <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4 text-sm text-amber-200">
                <div className="font-medium">Ошибки источников:</div>
                <ul className="mt-2 list-disc pl-5">
                  {data.errors.map((e, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{e.source}:</span>{" "}
                      {e.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* list */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-400">
                  Результатов:{" "}
                  <span className="text-zinc-200">
                    {data.items.length}
                  </span>
                </div>
                <div className="text-xs text-zinc-500">
                  query: {data.query}
                </div>
              </div>

              <div className="mt-3 grid gap-3">
                {data.items.map((it) => (
                  <motion.a
                    key={`${it.source}-${it.url}`}
                    href={it.url}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.15 }}
                    className="block rounded-xl border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-700"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium">{it.title}</div>
                      <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-300">
                        {it.source}
                      </span>
                    </div>

                    {it.snippet && (
                      <div className="mt-1 text-sm text-zinc-400">
                        {it.snippet}
                      </div>
                    )}

                    {it.score !== null && it.score !== undefined && (
                      <div className="mt-2 text-xs text-zinc-500">
                        score: {it.score}
                      </div>
                    )}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}