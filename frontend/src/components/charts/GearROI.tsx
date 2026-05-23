import { api } from "../../api/client";
import { useFetch } from "../../hooks/useAnalytics";
import { GearUsageData } from "../../types";

export default function GearROI() {
  const { data, loading } = useFetch<GearUsageData[]>(api.getGearUsage);

  if (loading || !data) return <div className="h-64 animate-pulse bg-gray-800 rounded" />;

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-400 mb-4">
        Add purchase prices in Gear settings to see cost-per-shot analysis
      </p>
      {data
        .filter((g) => g.type === "lens")
        .slice(0, 5)
        .map((gear) => (
          <div key={gear.model} className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-sm">{gear.model}</span>
            <span className="text-xs text-gray-400">{gear.count.toLocaleString()} shots</span>
          </div>
        ))}
    </div>
  );
}
