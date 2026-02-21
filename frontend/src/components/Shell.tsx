import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { NavLink } from "./NavLink";

export function Shell() {
  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">API Fusion</h1>
            <p className="mt-1 text-sm text-zinc-400">Unified API aggregator dashboard</p>
          </div>

          <nav className="flex gap-2">
            <NavLink to="/" label="Search" />
            <NavLink to="/sources" label="Sources" />
            <NavLink to="/logs" label="Logs" />
          </nav>
        </motion.header>

        <main className="mt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}