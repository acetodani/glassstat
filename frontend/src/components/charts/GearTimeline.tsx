import { api } from "../../api/client";
import { useFetch } from "../../hooks/useAnalytics";
import { GearUsageData } from "../../types";

export default function GearTimeline() {
  const { data, loading } = useFetch<GearUsageData[]>(api.getGearUsage);

  if (loading || !data) return <div className="h-64 bg-sand/30 rounded-2xl animate-pulse" />;

  const lenses = data.filter((g) => g.type === "lens").slice(0, 6);
  const maxCount = Math.max(...lenses.map((l) => l.count), 1);

  return (
    <div className="space-y-5">
      {lenses.map((lens, i) => (
        <div key={lens.model} className="group">
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-mono text-sm tracking-tight">{lens.model}</span>
            <span className="font-mono text-xs text-stone">
              {lens.count.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-3 bg-warm rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(lens.count / maxCount) * 100}%`,
                backgroundColor: i === 0 ? "#E8553D" : "#1A1A1A",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
