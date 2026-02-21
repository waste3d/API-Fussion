import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getSources } from "../lib/apiClient";
import type { SourceStatus } from "../lib/types";

export default function SourcePage() {
  const [data, setData] = useState<SourceStatus[] | null>(null);

  useEffect(() => {
    getSources().then(setData);
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="text-sm text-zinc-400">Sources status</div>

      <AnimatePresence mode="popLayout">
        {!data ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm text-zinc-500">
            Loading…
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid gap-3">
            {data.map((s) => (
              <div key={s.source} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4">
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
                  {s.latency_ms ? `${s.latency_ms} ms` : "—"} • {new Date(s.last_checked_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}