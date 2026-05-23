import { api } from "../../api/client";
import { useFetch } from "../../hooks/useAnalytics";
import { GearUsageData } from "../../types";

export default function GearTimeline() {
  const { data, loading } = useFetch<GearUsageData[]>(api.getGearUsage);

  if (loading || !data) return <div className="h-64 animate-pulse bg-gray-800 rounded" />;

  const lenses = data.filter((g) => g.type === "lens").slice(0, 8);
  const maxCount = Math.max(...lenses.map((l) => l.count), 1);

  return (
    <div className="space-y-3">
      {lenses.map((lens) => (
        <div key={lens.model} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-32 truncate" title={lens.model}>
            {lens.model}
          </span>
          <div className="flex-1 bg-gray-800 rounded-full h-5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-glass-600 to-glass-400 h-full rounded-full transition-all"
              style={{ width: `${(lens.count / maxCount) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 w-12 text-right">
            {lens.count.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
