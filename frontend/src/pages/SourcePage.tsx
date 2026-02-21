import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { apiGet } from "../lib/api";
import type { SourceStatus } from "../lib/api";

export default function SourcePage() {
  const [data, setData] = useState<SourceStatus[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError(null);
        const { data } = await apiGet<SourceStatus[]>("/v1/sources");
        if (!cancelled) setData(data);
      } catch (e: any) {
        if (!cancelled) {
          setData(null);
          setError(e?.message ?? "Ошибка загрузки");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="text-sm text-zinc-400">Sources status</div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <AnimatePresence mode="popLayout">
        {!data ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-sm text-zinc-500"
          >
            Loading…
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 grid gap-3"
          >
            {data.map((s) => (
              <div
                key={s.source}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      "h-2.5 w-2.5 rounded-full",
                      s.ok ? "bg-emerald-400" : "bg-red-400",
                    ].join(" ")}
                  />
                  <div className="text-sm font-medium">{s.source}</div>
                </div>

                <div className="text-xs text-zinc-500">
                  {typeof s.latency_ms === "number" ? `${s.latency_ms} ms` : "—"} •{" "}
                  {s.last_checked_at ? new Date(s.last_checked_at).toLocaleTimeString() : "—"}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}