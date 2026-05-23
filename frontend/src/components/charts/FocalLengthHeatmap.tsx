import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../../api/client";
import { useFetch } from "../../hooks/useAnalytics";
import { FocalLengthData } from "../../types";

export default function FocalLengthHeatmap() {
  const { data, loading } = useFetch<FocalLengthData[]>(api.getFocalLength);

  if (loading || !data) return <div className="h-64 animate-pulse bg-gray-800 rounded" />;

  const chartData = data.map((d) => ({
    name: `${d.focal_length}mm`,
    shots: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
          labelStyle={{ color: "#e5e7eb" }}
        />
        <Bar dataKey="shots" fill="#36adf8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
