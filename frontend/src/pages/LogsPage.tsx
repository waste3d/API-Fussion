import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiGet } from "../lib/api";
import type { LogRow } from "../lib/api";

export default function LogsPage() {
  const [rows, setRows] = useState<LogRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError(null);
        const { data } = await apiGet<LogRow[]>("/v1/logs?limit=50");
        if (!cancelled) setRows(data);
      } catch (e: any) {
        if (!cancelled) {
          setRows(null);
          setError(e?.message ?? "Ошибка загрузки логов");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="text-sm text-zinc-400">Request logs</div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {!rows ? (
        <div className="mt-4 text-sm text-zinc-500">Loading…</div>
      ) : (
        <div className="mt-4 grid gap-2">
          {rows.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{r.q ?? "—"}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    id: <span className="text-zinc-400">{r.request_id}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right text-xs text-zinc-500">
                  {r.ts ? new Date(r.ts).toLocaleTimeString() : "—"}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5">
                  sources: {(r.sources ?? []).join(", ")}
                </span>
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5">
                  took: {typeof r.took_ms === "number" ? `${r.took_ms}ms` : "—"}
                </span>
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5">
                  items: {typeof r.items_count === "number" ? r.items_count : "—"}
                </span>
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5">
                  errors: {typeof r.errors_count === "number" ? r.errors_count : "—"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}