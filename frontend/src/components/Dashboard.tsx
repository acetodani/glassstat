import { api, DashboardData } from "../api/client";
import { useFetch } from "../hooks/useAnalytics";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, AreaChart, Area } from "recharts";

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
        <button
          onClick={() => navigate("/ingest")}
          className="glass rounded-2xl px-6 py-3 text-sm font-medium hover:shadow-md transition-all ring-2 ring-accent/30 text-accent"
        >
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
          value={
            stats.date_range.earliest
              ? `${stats.date_range.earliest.slice(0, 4)}–${stats.date_range.latest?.slice(0, 4)}`
              : "—"
          }
          label="years active"
        />
      </section>

      {/* Recent uploads */}
      {recent_photos.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <SectionHead title="Recent Uploads" />
            <button onClick={() => navigate("/gallery")} className="font-mono text-xs text-stone hover:text-accent transition-colors">
              view all →
            </button>
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
                  <img src={`/api/photos/${photo.id}/file`} alt="" className="w-full h-full object-cover" loading="lazy" />
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

      {/* Focal length */}
      {focal_length.length > 0 && (
        <section>
          <SectionHead title="Focal Length" />
          <div className="glass rounded-[28px] p-8 mt-4">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={focal_length.map((d) => ({ name: `${d.focal_length}`, shots: d.count, pct: d.count / maxFL }))}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#A39E96", fontSize: 11, fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: string) => `${v}mm`}
                />
                <Bar dataKey="shots" radius={[8, 8, 4, 4]}>
                  {focal_length.map((d, i) => (
                    <Cell key={i} fill={d.count / maxFL > 0.7 ? "#E8553D" : d.count / maxFL > 0.4 ? "#1A1A1A" : "#D4CFC7"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Activity */}
      {activity.length > 0 && (
        <section>
          <SectionHead title="Activity" />
          <div className="glass rounded-[28px] p-8 mt-4">
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={activity}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E8553D" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#E8553D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="period"
                  tick={{ fill: "#A39E96", fontSize: 10, fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Area type="monotone" dataKey="count" stroke="#E8553D" strokeWidth={2} fill="url(#actGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Top gear */}
      {top_gear.length > 0 && (
        <section>
          <SectionHead title="Your Glass" />
          <div className="glass rounded-[28px] p-8 mt-4 space-y-5">
            {top_gear.map((item, i) => {
              const maxGear = top_gear[0].count;
              return (
                <button
                  key={item.lens}
                  onClick={() => navigate(`/gallery?lens=${encodeURIComponent(item.lens)}`)}
                  className="w-full group text-left"
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-stone">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-sm font-medium group-hover:text-accent transition-colors">{item.lens}</span>
                    </div>
                    <span className="font-mono text-sm tabular-nums">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(item.count / maxGear) * 100}%`, backgroundColor: i === 0 ? "#E8553D" : "#1A1A1A" }}
                    />
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
    <div className="glass rounded-3xl p-6 hover:shadow-md transition-shadow group">
      <p className={`font-display text-4xl md:text-5xl tracking-tight transition-colors ${accent ? "text-accent" : "text-ink group-hover:text-accent"}`}>
        {value}
      </p>
      <p className="font-mono text-[10px] text-stone uppercase tracking-[0.15em] mt-2">{label}</p>
    </div>
  );
}

function SectionHead({ title }: { title: string }) {
  return <h2 className="font-display text-2xl md:text-3xl">{title}</h2>;
}
