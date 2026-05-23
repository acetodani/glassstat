import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { api } from "../../api/client";
import { useFetch } from "../../hooks/useAnalytics";
import { FocalLengthData } from "../../types";

export default function FocalLengthHeatmap() {
  const { data, loading } = useFetch<FocalLengthData[]>(api.getFocalLength);

  if (loading || !data) return <div className="h-64 bg-sand/30 rounded-2xl animate-pulse" />;

  const maxCount = Math.max(...data.map((d) => d.count));
  const chartData = data.map((d) => ({
    name: `${d.focal_length}`,
    shots: d.count,
    pct: d.count / maxCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} barCategoryGap="20%">
        <XAxis
          dataKey="name"
          tick={{ fill: "#A39E96", fontSize: 11, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}mm`}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            backgroundColor: "#F8F6F1",
            border: "1px solid #D4CFC7",
            borderRadius: 12,
            fontFamily: "JetBrains Mono",
            fontSize: 12,
          }}
          cursor={{ fill: "rgba(212,207,199,0.3)" }}
          formatter={(value: number) => [`${value.toLocaleString()} shots`, ""]}
          labelFormatter={(label) => `${label}mm`}
        />
        <Bar dataKey="shots" radius={[8, 8, 4, 4]}>
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.pct > 0.7 ? "#E8553D" : entry.pct > 0.4 ? "#1A1A1A" : "#D4CFC7"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
