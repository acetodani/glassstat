import { NavLink } from "react-router-dom";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="glass-strong rounded-2xl px-6 py-3 flex items-baseline justify-between shadow-sm">
          <NavLink to="/" className="font-display text-xl tracking-tight hover:text-accent transition-colors">
            GlassStat
          </NavLink>
          <div className="flex gap-6 text-sm font-sans">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-ink font-medium" : "text-stone hover:text-ink transition-colors"
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/gallery"
              className={({ isActive }) =>
                isActive ? "text-ink font-medium" : "text-stone hover:text-ink transition-colors"
              }
            >
              Library
            </NavLink>
            <NavLink
              to="/wrapped"
              className={({ isActive }) =>
                isActive ? "text-ink font-medium" : "text-stone hover:text-ink transition-colors"
              }
            >
              Wrapped
            </NavLink>
            <NavLink
              to="/ingest"
              className={({ isActive }) =>
                isActive ? "text-ink font-medium" : "text-stone hover:text-ink transition-colors"
              }
            >
              Import
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
