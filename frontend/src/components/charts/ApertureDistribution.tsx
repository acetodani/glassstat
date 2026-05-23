import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { api } from "../../api/client";
import { useFetch } from "../../hooks/useAnalytics";
import { ApertureData } from "../../types";

export default function ApertureDistribution() {
  const { data, loading } = useFetch<ApertureData[]>(api.getAperture);

  if (loading || !data) return <div className="h-64 bg-sand/30 rounded-2xl animate-pulse" />;

  const maxCount = Math.max(...data.map((d) => d.count));
  const chartData = data.map((d) => ({
    name: `f/${d.aperture}`,
    shots: d.count,
    pct: d.count / maxCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} barCategoryGap="15%">
        <XAxis
          dataKey="name"
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
          cursor={{ fill: "rgba(212,207,199,0.3)" }}
        />
        <Bar dataKey="shots" radius={[6, 6, 3, 3]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.pct > 0.6 ? "#1A1A1A" : "#D4CFC7"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
