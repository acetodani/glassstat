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
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <p className="font-display text-6xl">0</p>
        <p className="text-stone text-sm">
          No photos scanned yet.{" "}
          <button onClick={() => navigate("/ingest")} className="text-accent underline underline-offset-2">
            Import your library
          </button>
        </p>
      </div>
    );
  }

  const { stats, recent_photos, top_gear, focal_length, activity } = data;
  const maxFL = Math.max(...focal_length.map((d) => d.count), 1);

  return (
    <div className="space-y-20 pt-8">
      {/* Hero stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-y-10">
        <HeroStat value={stats.total_photos.toLocaleString()} label="photos" accent />
        <HeroStat value={String(stats.unique_lenses)} label="lenses" />
        <HeroStat value={String(stats.unique_bodies)} label="bodies" />
        <HeroStat
          value={
            stats.date_range.earliest
              ? `${stats.date_range.earliest.slice(0, 4)}–${stats.date_range.latest?.slice(0, 4)}`
              : "—"
          }
          label="years active"
        />
      </section>

      {/* Recent photos strip */}
      {recent_photos.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <SectionHead title="Recent" note="latest imports" />
            <button
              onClick={() => navigate("/gallery")}
              className="text-xs font-mono text-stone hover:text-ink transition-colors"
            >
              view all →
            </button>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {recent_photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => navigate("/gallery")}
                className="aspect-square bg-warm rounded-xl overflow-hidden hover:scale-105 transition-transform"
              >
                {photo.has_file ? (
                  <img
                    src={`/api/photos/${photo.id}/file`}
                    alt={photo.file_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-mono text-[8px] text-stone text-center px-1 truncate">
                      {photo.file_name}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Focal length */}
      <section>
        <SectionHead title="Focal Length" note="where your eye gravitates" />
        <div className="bg-warm rounded-[28px] p-8 md:p-10 mt-5">
          <ResponsiveContainer width="100%" height={260}>
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

      {/* Activity timeline */}
      {activity.length > 0 && (
        <section>
          <SectionHead title="Activity" note="shots per month" />
          <div className="bg-warm rounded-[28px] p-8 md:p-10 mt-5">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={activity}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1A1A1A" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#1A1A1A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="period"
                  tick={{ fill: "#A39E96", fontSize: 10, fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Area type="monotone" dataKey="count" stroke="#1A1A1A" strokeWidth={2} fill="url(#actGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Top gear */}
      {top_gear.length > 0 && (
        <section>
          <SectionHead title="Your Glass" note="ranked by shutter count" />
          <div className="mt-5 space-y-5">
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
                      <span className="font-sans text-sm font-medium group-hover:text-accent transition-colors">
                        {item.lens}
                      </span>
                    </div>
                    <span className="font-mono text-sm tabular-nums">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-warm rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(item.count / maxGear) * 100}%`,
                        backgroundColor: i === 0 ? "#E8553D" : "#1A1A1A",
                      }}
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

function HeroStat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="group">
      <p className={`font-display text-5xl md:text-7xl tracking-tight transition-colors ${accent ? "text-accent" : "text-ink group-hover:text-accent"}`}>
        {value}
      </p>
      <p className="font-mono text-[10px] text-stone uppercase tracking-[0.2em] mt-2">{label}</p>
    </div>
  );
}

function SectionHead({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
      <span className="text-stone text-sm italic">{note}</span>
    </div>
  );
}
