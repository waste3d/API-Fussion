import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiGet } from "../lib/api";
import type { SearchItem, SearchResponse, SourceName } from "../lib/api";
import { useDebouncedValue } from "../lib/useDebouncedValue";

const ALL_SOURCES: { key: SourceName; label: string }[] = [
  { key: "github", label: "GitHub" },
  { key: "hackernews", label: "Hacker News" },
  { key: "rss", label: "RSS" },
];

function clsx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function SourceBadge({ source }: { source: string }) {
  const map: Record<string, string> = {
    github: "bg-white/10 border-white/15",
    hackernews: "bg-orange-500/10 border-orange-500/20",
    rss: "bg-sky-500/10 border-sky-500/20",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-white/80",
        map[source] ?? "bg-white/10 border-white/15"
      )}
    >
      {source}
    </span>
  );
}

function ItemCard({ item }: { item: SearchItem }) {
  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-sm backdrop-blur hover:bg-white/[0.06]"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <SourceBadge source={item.source} />
            {item.timestamp ? (
              <span className="text-xs text-white/40">{new Date(item.timestamp).toLocaleString()}</span>
            ) : (
              <span className="text-xs text-white/30">—</span>
            )}
          </div>

          <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-white/90 group-hover:text-white">
            {item.title}
          </h3>

          {item.snippet ? (
            <p className="mt-2 line-clamp-3 text-sm text-white/60">{item.snippet}</p>
          ) : (
            <p className="mt-2 text-sm text-white/30">Нет описания</p>
          )}
        </div>

        <div className="shrink-0 text-right">
          {typeof item.score === "number" ? (
            <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
              score: {Math.round(item.score)}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/40">
              score: —
            </div>
          )}
        </div>
      </div>
    </motion.a>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="w-full">
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
          </div>
          <div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-4 w-3/5 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-white/10" />
        </div>
        <div className="h-8 w-20 animate-pulse rounded-xl bg-white/10" />
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [q, setQ] = useState("python");
  const debouncedQ = useDebouncedValue(q, 350);

  const [selectedSources, setSelectedSources] = useState<SourceName[]>(["github", "hackernews"]);
  const [limit, setLimit] = useState(20);

  const [items, setItems] = useState<SearchItem[]>([]);
  const [errors, setErrors] = useState<Array<{ source: string; type: string; message: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [tookMs, setTookMs] = useState<number | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("q", debouncedQ.trim() || " ");
    params.set("limit", String(limit));
    selectedSources.forEach((s) => params.append("sources", s));
    return params.toString();
  }, [debouncedQ, limit, selectedSources]);

  useEffect(() => {
    const qq = debouncedQ.trim();
    if (!qq) {
      setItems([]);
      setErrors([]);
      setFatal(null);
      setTookMs(null);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      setLoading(true);
      setFatal(null);

      try {
        const { data, headers } = await apiGet<SearchResponse>(`/v1/search?${queryString}`, ac.signal);
        setItems(data.items ?? []);
        setErrors(data.errors ?? []);

        const took = headers.get("x-took-ms");
        setTookMs(took ? Number(took) : null);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setFatal(e?.message ?? "Неизвестная ошибка");
        setItems([]);
        setErrors([]);
        setTookMs(null);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [queryString, debouncedQ]);

  function toggleSource(s: SourceName) {
    setSelectedSources((prev) => {
      const has = prev.includes(s);
      const next = has ? prev.filter((x) => x !== s) : [...prev, s];
      return next.length ? next : prev; // не даём выбрать 0 источников
    });
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-[38rem] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute top-40 right-[-10rem] h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-[-12rem] h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* topbar */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
              ⚡
            </div>
            <div>
              <div className="text-sm font-semibold">API Fusion</div>
              <div className="text-xs text-white/50">поиск по нескольким источникам</div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <div className="relative w-full md:w-[28rem]">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Например: fastapi"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">
                {tookMs !== null ? `${tookMs} ms` : ""}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-white/50">limit</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              >
                {[10, 20, 30, 50].map((n) => (
                  <option key={n} value={n} className="bg-neutral-900">
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* sources */}
        <div className="mx-auto max-w-6xl px-4 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {ALL_SOURCES.map((s) => {
              const active = selectedSources.includes(s.key);
              return (
                <button
                  key={s.key}
                  onClick={() => toggleSource(s.key)}
                  className={clsx(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/8"
                  )}
                >
                  {s.label}
                </button>
              );
            })}
            <div className="ml-auto text-xs text-white/40">
              {loading ? "загрузка…" : `${items.length} результатов`}
            </div>
          </div>
        </div>
      </div>

      {/* content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {fatal ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
            {fatal}
          </div>
        ) : null}

        {errors.length ? (
          <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="text-sm font-semibold text-amber-100">Ошибки источников</div>
            <ul className="mt-2 space-y-1 text-sm text-amber-100/80">
              {errors.map((e, idx) => (
                <li key={idx}>
                  <span className="font-medium">{e.source}</span>: {e.message}{" "}
                  <span className="text-amber-100/60">({e.type})</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <AnimatePresence>
              {items.map((it) => (
                <ItemCard key={`${it.source}:${it.url}`} item={it} />
              ))}
            </AnimatePresence>
          )}
        </div>

        {!loading && !fatal && items.length === 0 && debouncedQ.trim() ? (
          <div className="mt-10 text-center text-sm text-white/50">Ничего не найдено</div>
        ) : null}
      </main>
    </div>
  );
}