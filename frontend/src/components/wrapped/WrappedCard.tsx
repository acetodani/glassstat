import { useRef } from "react";
import { Camera, MapPin, Flame } from "lucide-react";

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
  primary: { name: string; emoji: string; description: string; confidence: number } | null;
}

export default function WrappedCard({ data, archetype }: { data: WrappedData; archetype: ArchetypeData }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#0a0a1a" });
      canvas.toBlob((blob) => {
        if (!blob) return;
        if (navigator.share) {
          const file = new File([blob], `glassstat-wrapped-${data.year}.png`, { type: "image/png" });
          navigator.share({ files: [file], title: `My ${data.year} in Photos` });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `glassstat-wrapped-${data.year}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch {
      // Fallback: just download
    }
  };

  if (!data.has_data) {
    return (
      <div className="text-center py-12 text-gray-500">
        No data for this year. Scan some photos first!
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={cardRef}
        className="w-[400px] bg-gradient-to-br from-gray-900 via-[#0d1525] to-gray-900 border border-gray-700 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-6">
          <p className="text-glass-400 text-xs font-semibold tracking-widest uppercase">
            {data.year} in Photos
          </p>
          <p className="text-5xl font-bold mt-2">{data.total_photos.toLocaleString()}</p>
          <p className="text-gray-400 text-sm mt-1">photos captured</p>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Top Lens</span>
            <span className="font-medium text-right max-w-[200px] truncate">{data.top_lens}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-glass-600 to-glass-300 h-2 rounded-full"
              style={{ width: `${data.top_lens_percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">{data.top_lens_percentage}% of all shots</p>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-800">
            <div>
              <p className="text-gray-500 text-xs">Fav Focal Length</p>
              <p className="font-semibold">{data.top_focal_length}mm</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Camera Body</p>
              <p className="font-semibold truncate">{data.top_body}</p>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              <div>
                <p className="text-gray-500 text-xs">Longest Streak</p>
                <p className="font-semibold">{data.longest_streak_days} days</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-glass-400" />
              <div>
                <p className="text-gray-500 text-xs">Locations</p>
                <p className="font-semibold">{data.unique_locations}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-gray-500 text-xs">Busiest Month</p>
            <p className="font-semibold">{data.busiest_month} — {data.busiest_month_count.toLocaleString()} shots</p>
          </div>

          {data.golden_hour_percentage > 20 && (
            <div className="mt-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-300 text-xs">
                Golden Hour Shooter — {data.golden_hour_percentage}% of photos during magic hour
              </p>
            </div>
          )}

          {archetype.primary && (
            <div className="mt-4 pt-4 border-t border-gray-800 text-center">
              <p className="text-gray-500 text-xs uppercase tracking-wide">Your Archetype</p>
              <p className="text-lg font-bold mt-1">{archetype.primary.name}</p>
              <p className="text-xs text-gray-400 mt-1">{archetype.primary.description}</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-gray-600">glassstat.dev</p>
        </div>
      </div>

      <button
        onClick={handleShare}
        className="px-6 py-2.5 bg-glass-600 hover:bg-glass-500 rounded-lg text-sm font-medium transition-colors"
      >
        Download & Share
      </button>
    </div>
  );
}
