import { NavLink } from "react-router-dom";

export default function Nav() {
  return (
    <nav className="max-w-6xl mx-auto px-6 py-8 flex items-baseline justify-between">
      <NavLink to="/" className="font-display text-2xl tracking-tight">
        GlassStat
      </NavLink>
      <div className="flex gap-8 text-sm font-sans">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "text-ink" : "text-stone hover:text-ink transition-colors"
          }
        >
          Overview
        </NavLink>
        <NavLink
          to="/wrapped"
          className={({ isActive }) =>
            isActive ? "text-ink" : "text-stone hover:text-ink transition-colors"
          }
        >
          Wrapped
        </NavLink>
        <NavLink
          to="/ingest"
          className={({ isActive }) =>
            isActive ? "text-ink" : "text-stone hover:text-ink transition-colors"
          }
        >
          Import
        </NavLink>
      </div>
    </nav>
  );
}
