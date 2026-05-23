import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../../api/client";
import { useFetch } from "../../hooks/useAnalytics";
import { TimelineData } from "../../types";

export default function ShootingTimeline() {
  const { data, loading } = useFetch<TimelineData[]>(() => api.getTimeline("monthly"));

  if (loading || !data) return <div className="h-48 animate-pulse bg-gray-800 rounded" />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorShots" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#36adf8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#36adf8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="period" tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
          labelStyle={{ color: "#e5e7eb" }}
        />
        <Area type="monotone" dataKey="count" stroke="#36adf8" fill="url(#colorShots)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
