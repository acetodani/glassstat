import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../../api/client";
import { useFetch } from "../../hooks/useAnalytics";
import { ISOData } from "../../types";

export default function ISOPatterns() {
  const { data, loading } = useFetch<ISOData[]>(api.getISO);

  if (loading || !data) return <div className="h-64 animate-pulse bg-gray-800 rounded" />;

  const chartData = data.map((d) => ({
    name: `${d.iso}`,
    shots: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
          labelStyle={{ color: "#e5e7eb" }}
        />
        <Bar dataKey="shots" fill="#0c93e9" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
