import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../../api/client";
import { useFetch } from "../../hooks/useAnalytics";
import { TimelineData } from "../../types";

export default function ShootingTimeline() {
  const { data, loading } = useFetch<TimelineData[]>(() => api.getTimeline("monthly"));

  if (loading || !data) return <div className="h-48 bg-sand/30 rounded-2xl animate-pulse" />;

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillTimeline" x1="0" y1="0" x2="0" y2="1">
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
        <Tooltip
          contentStyle={{
            backgroundColor: "#F8F6F1",
            border: "1px solid #D4CFC7",
            borderRadius: 12,
            fontFamily: "JetBrains Mono",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#1A1A1A"
          strokeWidth={2}
          fill="url(#fillTimeline)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
