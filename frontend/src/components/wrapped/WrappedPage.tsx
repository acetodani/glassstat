import { useFetch } from "../../hooks/useAnalytics";
import { useNavigate } from "react-router-dom";
import WrappedCard from "./WrappedCard";

interface BestPhoto {
  has_best: boolean;
  id?: number;
  file_name?: string;
  lens?: string;
  focal_length?: number;
  aperture?: number;
  iso?: number;
  shutter_speed?: string;
  date_taken?: string;
  camera?: string;
  score?: number;
  subject?: string;
  why?: string;
}

export default function WrappedPage() {
  const year = new Date().getFullYear();
  const { data: wrappedData, loading: wLoad } = useFetch(
    () => fetch(`/api/wrapped/?year=${year}`).then((r) => r.json()),
    `wrapped-${year}`
  );
  const { data: archetypeData, loading: aLoad } = useFetch(
    () => fetch("/api/wrapped/archetype").then((r) => r.json()),
    "archetype"
  );
  const { data: bestPhoto, loading: bLoad } = useFetch<BestPhoto>(
    () => fetch("/api/wrapped/best-photo").then((r) => r.json()),
    "best-photo"
  );
  const navigate = useNavigate();

  if (wLoad || aLoad || bLoad) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!wrappedData || !wrappedData.has_data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-fade-in">
        <p className="font-display text-5xl">{year}</p>
        <p className="text-stone text-center max-w-sm">
          Upload photos taken this year to generate your Wrapped card. We need shots with dates to build your story.
        </p>
        <button
          onClick={() => navigate("/ingest")}
          className="glass rounded-2xl px-6 py-3 text-sm font-medium hover:shadow-md transition-all ring-2 ring-accent/30 text-accent"
        >
          Import photos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pt-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="font-display text-6xl">{year}</h1>
        <p className="text-stone mt-2">your year in photos</p>
      </div>

      {/* Best photo of the year */}
      {bestPhoto && bestPhoto.has_best && bestPhoto.id && (
        <div className="mb-10 animate-slide-up">
          <p className="font-mono text-[10px] text-stone uppercase tracking-widest text-center mb-3">
            your best shot
          </p>
          <div className="glass rounded-[24px] overflow-hidden">
            <img
              src={`/api/photos/${bestPhoto.id}/file`}
              alt={bestPhoto.file_name}
              className="w-full aspect-[3/2] object-cover"
            />
            <div className="p-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="font-display text-lg">{bestPhoto.lens || "Unknown lens"}</p>
                  <p className="font-mono text-xs text-stone mt-0.5">
                    {[
                      bestPhoto.focal_length && `${bestPhoto.focal_length}mm`,
                      bestPhoto.aperture && `f/${bestPhoto.aperture}`,
                      bestPhoto.iso && `ISO ${bestPhoto.iso}`,
                      bestPhoto.shutter_speed,
                    ].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {bestPhoto.score && (
                  <span className="font-mono text-sm text-accent font-medium">{bestPhoto.score}/100</span>
                )}
              </div>
              {bestPhoto.subject && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="glass-subtle rounded-full px-3 py-1 font-mono text-[10px] text-ink capitalize">
                    {bestPhoto.subject}
                  </span>
                  {bestPhoto.date_taken && (
                    <span className="font-mono text-[10px] text-sand">
                      {new Date(bestPhoto.date_taken).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              )}
              {bestPhoto.why && (
                <p className="font-mono text-[10px] text-stone mt-2">{bestPhoto.why}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <WrappedCard data={wrappedData} archetype={archetypeData || { primary: null }} />
    </div>
  );
}
