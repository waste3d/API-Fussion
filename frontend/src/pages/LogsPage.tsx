import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getLogs } from "../lib/apiClient";
import type { LogRow } from "../lib/types";

export default function LogsPage() {
  const [rows, setRows] = useState<LogRow[] | null>(null);

  useEffect(() => {
    getLogs().then(setRows);
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="text-sm text-zinc-400">Request logs (mock)</div>

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
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{r.q}</div>
                <div className="text-xs text-zinc-500">{new Date(r.ts).toLocaleTimeString()}</div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-400">
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5">
                  sources: {r.sources.join(",")}
                </span>
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5">
                  took: {r.took_ms}ms
                </span>
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5">
                  items: {r.items}
                </span>
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5">
                  errors: {r.errors}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}