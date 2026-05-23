import { NavLink } from "react-router-dom";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-40 pt-4 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass-strong rounded-2xl px-6 py-3 flex items-baseline justify-between">
          <NavLink to="/" className="font-display text-xl tracking-tight hover:text-accent transition-colors">
            GlassStat
          </NavLink>
          <div className="flex gap-6 text-sm font-sans">
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            <NavLink to="/overview" className={linkClass}>Overview</NavLink>
            <NavLink to="/gallery" className={linkClass}>Library</NavLink>
            <NavLink to="/wrapped" className={linkClass}>Wrapped</NavLink>
            <NavLink to="/ingest" className={linkClass}>Import</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

function linkClass({ isActive }: { isActive: boolean }) {
  return isActive ? "text-ink font-medium" : "text-stone hover:text-ink transition-colors";
}
