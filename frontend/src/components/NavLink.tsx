import { Link, useLocation } from "react-router-dom";

export function NavLink({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={[
        "rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-zinc-900 text-zinc-100 border border-zinc-700"
          : "text-zinc-400 hover:text-zinc-200 border border-transparent",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}