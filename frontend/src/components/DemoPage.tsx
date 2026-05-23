import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, AreaChart, Area } from "recharts";

const DEMO_STATS = { total: "12,847", lenses: "7", bodies: "3", years: "2020–2024" };

const DEMO_FOCAL = [
  { name: "16", shots: 420, pct: 0.2 },
  { name: "24", shots: 1230, pct: 0.5 },
  { name: "35", shots: 2890, pct: 1.0 },
  { name: "50", shots: 2100, pct: 0.73 },
  { name: "70", shots: 980, pct: 0.34 },
  { name: "85", shots: 1650, pct: 0.57 },
  { name: "100", shots: 1400, pct: 0.48 },
  { name: "135", shots: 890, pct: 0.31 },
  { name: "200", shots: 520, pct: 0.18 },
];

const DEMO_ACTIVITY = [
  { period: "Jan", count: 890 }, { period: "Feb", count: 720 },
  { period: "Mar", count: 1100 }, { period: "Apr", count: 1340 },
  { period: "May", count: 980 }, { period: "Jun", count: 1560 },
  { period: "Jul", count: 1820 }, { period: "Aug", count: 1450 },
  { period: "Sep", count: 1200 }, { period: "Oct", count: 940 },
  { period: "Nov", count: 670 }, { period: "Dec", count: 1180 },
];

const DEMO_GEAR = [
  { lens: "Sony FE 35mm f/1.4 GM", count: 4231, pct: 1.0 },
  { lens: "Sony FE 24-70mm f/2.8 GM II", count: 2944, pct: 0.7 },
  { lens: "Sony FE 85mm f/1.4 GM", count: 1872, pct: 0.44 },
  { lens: "Sigma 35mm f/1.4 Art", count: 1203, pct: 0.28 },
  { lens: "Sony FE 70-200mm f/2.8 GM II", count: 890, pct: 0.21 },
];

const DEMO_WRAPPED = {
  total: "5,847",
  topLens: "35mm f/1.4 GM",
  topLensPct: 43,
  archetype: "The Bokeh Addict",
  archetypeDesc: "You live life wide open. Shallow depth of field is your love language.",
  streak: 14,
  goldenHour: 38,
  locations: 12,
};

export default function DemoPage() {
  return (
    <div className="space-y-16 pt-4 animate-fade-in">
      <div className="text-center">
        <span className="glass-subtle rounded-full px-4 py-1.5 font-mono text-[10px] text-accent uppercase tracking-widest">
          demo
        </span>
        <h1 className="font-display text-5xl mt-4">Sample Dashboard</h1>
        <p className="text-stone mt-2 max-w-md mx-auto">
          This is what your stats look like after importing your photo library. All data below is sample data.
        </p>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DemoStat value={DEMO_STATS.total} label="photos" accent />
        <DemoStat value={DEMO_STATS.lenses} label="lenses" />
        <DemoStat value={DEMO_STATS.bodies} label="bodies" />
        <DemoStat value={DEMO_STATS.years} label="years active" />
      </section>

      {/* Focal length */}
      <section>
        <h2 className="font-display text-2xl mb-4">Focal Length</h2>
        <div className="glass rounded-[28px] p-8">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DEMO_FOCAL}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#A39E96", fontSize: 11, fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: string) => `${v}mm`}
              />
              <Bar dataKey="shots" radius={[8, 8, 4, 4]}>
                {DEMO_FOCAL.map((d, i) => (
                  <Cell key={i} fill={d.pct > 0.7 ? "#E8553D" : d.pct > 0.4 ? "#1A1A1A" : "#D4CFC7"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Activity */}
      <section>
        <h2 className="font-display text-2xl mb-4">Activity</h2>
        <div className="glass rounded-[28px] p-8">
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={DEMO_ACTIVITY}>
              <defs>
                <linearGradient id="demoGrad" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="count" stroke="#E8553D" strokeWidth={2} fill="url(#demoGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Gear */}
      <section>
        <h2 className="font-display text-2xl mb-4">Your Glass</h2>
        <div className="glass rounded-[28px] p-8 space-y-5">
          {DEMO_GEAR.map((item, i) => (
            <div key={item.lens}>
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-stone">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm font-medium">{item.lens}</span>
                </div>
                <span className="font-mono text-sm tabular-nums">{item.count.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${item.pct * 100}%`, backgroundColor: i === 0 ? "#E8553D" : "#1A1A1A" }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wrapped preview */}
      <section>
        <h2 className="font-display text-2xl mb-4">Wrapped Card</h2>
        <div className="max-w-sm mx-auto glass rounded-[28px] p-8 space-y-6 text-center">
          <div>
            <p className="font-display text-6xl tracking-tight">{DEMO_WRAPPED.total}</p>
            <p className="font-mono text-[10px] text-stone uppercase tracking-widest mt-2">photos captured in 2024</p>
          </div>
          <div className="text-left">
            <p className="font-mono text-[9px] text-stone uppercase tracking-widest">top lens</p>
            <p className="font-display text-xl mt-1">{DEMO_WRAPPED.topLens}</p>
            <div className="w-full h-2 bg-white/40 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${DEMO_WRAPPED.topLensPct}%` }} />
            </div>
            <p className="font-mono text-[10px] text-stone mt-1">{DEMO_WRAPPED.topLensPct}% of all shots</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-left">
            <MiniStat label="streak" value={`${DEMO_WRAPPED.streak}d`} />
            <MiniStat label="golden hr" value={`${DEMO_WRAPPED.goldenHour}%`} />
            <MiniStat label="locations" value={String(DEMO_WRAPPED.locations)} />
          </div>
          <div className="pt-4 border-t border-white/30">
            <p className="font-mono text-[9px] text-stone uppercase tracking-widest">archetype</p>
            <p className="font-display text-xl mt-1">{DEMO_WRAPPED.archetype}</p>
            <p className="text-stone text-xs mt-1">{DEMO_WRAPPED.archetypeDesc}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-8">
        <p className="text-stone text-sm mb-4">Ready to see your own stats?</p>
        <a href="/ingest" className="inline-block glass rounded-2xl px-8 py-3 text-sm font-medium hover:shadow-md transition-all ring-2 ring-accent/30 text-accent">
          Import your photos
        </a>
      </section>
    </div>
  );
}

function DemoStat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="glass rounded-3xl p-6">
      <p className={`font-display text-4xl md:text-5xl tracking-tight ${accent ? "text-accent" : ""}`}>{value}</p>
      <p className="font-mono text-[10px] text-stone uppercase tracking-[0.15em] mt-2">{label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] text-stone uppercase tracking-widest">{label}</p>
      <p className="font-display text-lg mt-0.5">{value}</p>
    </div>
  );
}
