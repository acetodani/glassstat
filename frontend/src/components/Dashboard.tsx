import { api, DashboardData } from "../api/client";
import { useFetch } from "../hooks/useAnalytics";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const { data, loading } = useFetch<DashboardData>(api.getDashboard, "dashboard");
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.stats.total_photos === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-fade-in">
        <p className="font-display text-5xl">No data yet</p>
        <p className="text-stone">Upload some photos to see your stats here.</p>
        <button onClick={() => navigate("/ingest")} className="glass rounded-2xl px-6 py-3 text-sm font-medium hover:shadow-md transition-all">
          Import photos
        </button>
      </div>
    );
  }

  const { stats, recent_photos, top_gear, focal_length, activity } = data;
  const maxFL = Math.max(...focal_length.map((d) => d.count), 1);

  return (
    <div className="space-y-16 pt-4 animate-fade-in">
      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={stats.total_photos.toLocaleString()} label="photos uploaded" accent />
        <StatCard value={String(stats.unique_lenses)} label="unique lenses" />
        <StatCard value={String(stats.unique_bodies)} label="camera bodies" />
        <StatCard
          value={stats.date_range.earliest ? `${stats.date_range.earliest.slice(0, 4)}–${stats.date_range.latest?.slice(0, 4)}` : "—"}
          label="years active"
        />
      </section>

      {/* Recent uploads */}
      {recent_photos.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <SectionHead title="Recent Uploads" />
            <button onClick={() => navigate("/gallery")} className="font-mono text-xs text-stone hover:text-ink transition-colors">view all →</button>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {recent_photos.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => navigate("/gallery")}
                className="aspect-square rounded-2xl overflow-hidden hover:scale-105 transition-transform glass animate-pop-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {photo.has_file ? (
                  <img src={`/api/photos/${photo.id}/thumb`} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-mono text-[8px] text-stone">{photo.focal_length ? `${photo.focal_length}mm` : "—"}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Focal length — sky blue gradient bars */}
      {focal_length.length > 0 && (
        <section>
          <SectionHead title="Focal Length" />
          <div className="glass rounded-[28px] p-6 md:p-8 mt-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={focal_length.map((d) => ({ name: `${d.focal_length}mm`, shots: d.count, pct: d.count / maxFL }))} barCategoryGap="18%">
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  cursor={{ fill: "rgba(56, 189, 248, 0.06)", radius: 8 }}
                  contentStyle={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.9)", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.08)", fontFamily: "JetBrains Mono", fontSize: 12 }}
                  formatter={(value: number) => [`${value.toLocaleString()} shots`, ""]}
                />
                <Bar dataKey="shots" radius={[8, 8, 3, 3]} animationDuration={900}>
                  {focal_length.map((d, i) => (
                    <Cell key={i} fill={
                      d.count / maxFL > 0.7 ? "#0EA5E9" :
                      d.count / maxFL > 0.4 ? "#38BDF8" :
                      d.count / maxFL > 0.2 ? "#7DD3FC" : "#BAE6FD"
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Activity — warm orange area */}
      {activity.length > 0 && (
        <section>
          <SectionHead title="Activity" />
          <div className="glass rounded-[28px] p-6 md:p-8 mt-4">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={activity}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FB923C" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#FB923C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="period" tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip
                  cursor={{ stroke: "#FB923C", strokeWidth: 1, strokeDasharray: "4 4" }}
                  contentStyle={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.9)", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.08)", fontFamily: "JetBrains Mono", fontSize: 12 }}
                  formatter={(value: number) => [`${value.toLocaleString()} shots`, ""]}
                />
                <Area type="monotone" dataKey="count" stroke="#F97316" strokeWidth={2.5} fill="url(#actGrad)" dot={{ r: 3, fill: "#F97316", strokeWidth: 0 }} activeDot={{ r: 6, fill: "#F97316", stroke: "#fff", strokeWidth: 2 }} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Top gear — gradient bars blue to orange */}
      {top_gear.length > 0 && (
        <section>
          <SectionHead title="Your Glass" />
          <div className="glass rounded-[28px] p-6 md:p-8 mt-4 space-y-5">
            {top_gear.map((item, i) => {
              const maxGear = top_gear[0].count;
              const colors = ["#0EA5E9", "#38BDF8", "#7DD3FC", "#BAE6FD", "#E0F2FE"];
              return (
                <button key={item.lens} onClick={() => navigate(`/gallery?lens=${encodeURIComponent(item.lens)}`)} className="w-full group text-left">
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-stone">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-sm font-medium group-hover:text-sky-600 transition-colors">{item.lens}</span>
                    </div>
                    <span className="font-mono text-sm tabular-nums">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden bg-sky-50">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(item.count / maxGear) * 100}%`, backgroundColor: colors[i] || colors[4] }} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="glass rounded-3xl p-6 hover:shadow-lg transition-all hover:scale-[1.02] group">
      <p className={`font-display text-4xl md:text-5xl tracking-tight transition-colors ${accent ? "text-sky-600" : "text-ink group-hover:text-sky-600"}`}>{value}</p>
      <p className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.15em] mt-2">{label}</p>
    </div>
  );
}

function SectionHead({ title }: { title: string }) {
  return <h2 className="font-display text-2xl md:text-3xl">{title}</h2>;
}
