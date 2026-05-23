import { api } from "../../api/client";
import { useFetch } from "../../hooks/useAnalytics";
import { GearUsageData } from "../../types";

const COLORS = ["#E8553D", "#1A1A1A", "#1A1A1A", "#A39E96", "#A39E96", "#D4CFC7"];

export default function GearTimeline() {
  const { data, loading } = useFetch<GearUsageData[]>(api.getGearUsage);

  if (loading || !data) return <div className="h-64 bg-warm rounded-[28px] animate-pulse" />;

  const lenses = data.filter((g) => g.type === "lens").slice(0, 6);
  const maxCount = Math.max(...lenses.map((l) => l.count), 1);

  return (
    <div className="space-y-6">
      {lenses.map((lens, i) => (
        <div key={lens.model} className="group cursor-default">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-stone">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-sans text-sm font-medium group-hover:text-accent transition-colors">
                {lens.model}
              </span>
            </div>
            <span className="font-mono text-sm tabular-nums">
              {lens.count.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-3 bg-warm rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(lens.count / maxCount) * 100}%`,
                backgroundColor: COLORS[i] || "#D4CFC7",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
