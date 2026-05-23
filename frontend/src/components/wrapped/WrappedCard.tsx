import { useRef } from "react";

interface WrappedData {
  year: number;
  has_data: boolean;
  total_photos: number;
  top_lens: string;
  top_lens_percentage: number;
  top_focal_length: number | null;
  top_body: string;
  busiest_month: string;
  busiest_month_count: number;
  golden_hour_percentage: number;
  average_iso: number | null;
  unique_locations: number;
  longest_streak_days: number;
}

interface ArchetypeData {
  primary: { name: string; description: string; confidence: number } | null;
}

export default function WrappedCard({ data, archetype }: { data: WrappedData; archetype: ArchetypeData }) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!data.has_data) {
    return (
      <div className="text-center py-12 text-stone">
        No data for this year yet.
      </div>
    );
  }

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#F8F6F1" });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `glassstat-${data.year}.png`;
      a.click();
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        ref={cardRef}
        className="w-full bg-warm rounded-3xl p-10 space-y-8"
      >
        {/* Total */}
        <div className="text-center">
          <p className="font-display text-7xl tracking-tight">{data.total_photos.toLocaleString()}</p>
          <p className="font-mono text-xs text-stone uppercase tracking-widest mt-2">photos captured</p>
        </div>

        {/* Top lens with bar */}
        <div>
          <p className="font-mono text-xs text-stone uppercase tracking-widest">top lens</p>
          <p className="font-display text-2xl mt-1">{data.top_lens}</p>
          <div className="w-full h-2 bg-sand rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full"
              style={{ width: `${data.top_lens_percentage}%` }}
            />
          </div>
          <p className="font-mono text-xs text-stone mt-1">{data.top_lens_percentage}% of all shots</p>
        </div>

        {/* Grid stats */}
        <div className="grid grid-cols-2 gap-6">
          <MiniStat label="focal length" value={data.top_focal_length ? `${data.top_focal_length}mm` : "—"} />
          <MiniStat label="body" value={data.top_body} />
          <MiniStat label="busiest month" value={data.busiest_month} />
          <MiniStat label="streak" value={`${data.longest_streak_days} days`} />
          <MiniStat label="golden hour" value={`${data.golden_hour_percentage}%`} />
          <MiniStat label="locations" value={String(data.unique_locations)} />
        </div>

        {/* Archetype */}
        {archetype.primary && (
          <div className="pt-6 border-t border-sand text-center">
            <p className="font-mono text-xs text-stone uppercase tracking-widest">your archetype</p>
            <p className="font-display text-2xl mt-2">{archetype.primary.name}</p>
            <p className="text-stone text-sm mt-1">{archetype.primary.description}</p>
          </div>
        )}

        <p className="text-center font-mono text-[10px] text-sand">glassstat.dev</p>
      </div>

      <button
        onClick={handleDownload}
        className="px-8 py-3 bg-ink text-cream rounded-xl text-sm font-medium hover:bg-ink/80 transition-colors"
      >
        Download card
      </button>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] text-stone uppercase tracking-widest">{label}</p>
      <p className="font-display text-xl mt-0.5 truncate">{value}</p>
    </div>
  );
}
