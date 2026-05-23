import { NavLink } from "react-router-dom";
import { BarChart3, Upload, Camera } from "lucide-react";

const navItems = [
  { to: "/", icon: BarChart3, label: "Dashboard" },
  { to: "/ingest", icon: Upload, label: "Import" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <Camera className="w-8 h-8 text-glass-400" />
        <h1 className="text-xl font-bold tracking-tight">GlassStat</h1>
      </div>
      <nav className="flex-1 px-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                isActive
                  ? "bg-glass-600/20 text-glass-300"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
        v0.1.0
      </div>
    </aside>
  );
}
