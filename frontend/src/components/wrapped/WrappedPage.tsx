import { useState } from "react";
import { useFetch } from "../../hooks/useAnalytics";
import { useNavigate } from "react-router-dom";
import { api, DashboardData } from "../../api/client";
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
  const { data: dashboard } = useFetch<DashboardData>(api.getDashboard, "dashboard");
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

  const totalPhotos = dashboard?.stats.total_photos || 0;

  if (wLoad || aLoad || bLoad) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not enough photos
  if (totalPhotos < 10) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-fade-in">
        <p className="font-display text-6xl">{totalPhotos}</p>
        <p className="font-mono text-xs text-stone uppercase tracking-widest">photos uploaded</p>
        <div className="glass rounded-3xl p-8 max-w-sm text-center mt-4">
          <p className="font-display text-2xl">Upload more</p>
          <p className="text-stone text-sm mt-2">
            You need at least 10 photos to generate your Wrapped card and find your best shot. You have {totalPhotos} so far.
          </p>
          <div className="w-full h-2 bg-black/5 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-black/50 rounded-full transition-all"
              style={{ width: `${Math.min(100, (totalPhotos / 10) * 100)}%` }}
            />
          </div>
          <p className="font-mono text-[10px] text-stone mt-2">{totalPhotos}/10 minimum</p>
        </div>
        <button
          onClick={() => navigate("/ingest")}
          className="glass rounded-2xl px-6 py-3 text-sm font-medium hover:shadow-md transition-all ring-2 ring-black/20 text-ink mt-2"
        >
          Import photos
        </button>
      </div>
    );
  }

  // Has data but no yearly wrapped (photos might not have dates)
  if (!wrappedData || !wrappedData.has_data) {
    return (
      <div className="max-w-md mx-auto pt-8 animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="font-display text-6xl">{year}</h1>
          <p className="text-stone mt-2">your year in photos</p>
        </div>

        {/* Still show best photo even without yearly data */}
        {bestPhoto && bestPhoto.has_best && bestPhoto.id && (
          <BestPhotoCard photo={bestPhoto} />
        )}

        <div className="glass rounded-3xl p-8 text-center mt-8">
          <p className="text-stone text-sm">
            Your photos don't have date information for {year}. Upload photos taken this year to get your full Wrapped card.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pt-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="font-display text-6xl">{year}</h1>
        <p className="text-stone mt-2">your year in photos</p>
      </div>

      {/* Best photo */}
      {bestPhoto && bestPhoto.has_best && bestPhoto.id && (
        <BestPhotoCard photo={bestPhoto} />
      )}

      {/* Wrapped card */}
      <div className="mt-10">
        <WrappedCard data={wrappedData} archetype={archetypeData || { primary: null }} />
      </div>
    </div>
  );
}

function BestPhotoCard({ photo }: { photo: BestPhoto }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="animate-slide-up">
        <p className="font-mono text-[10px] text-stone uppercase tracking-widest text-center mb-3">
          your best shot
        </p>
        <button onClick={() => setExpanded(true)} className="w-full text-left glass rounded-[24px] overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.01] transition-all">
          <img
            src={`/api/photos/${photo.id}/file`}
            alt={photo.file_name}
            className="w-full aspect-[3/2] object-cover"
          />
          <div className="p-5">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-display text-lg">{photo.lens || "Unknown lens"}</p>
                <p className="font-mono text-xs text-stone mt-0.5">
                  {[
                    photo.focal_length && `${photo.focal_length}mm`,
                    photo.aperture && `f/${photo.aperture}`,
                    photo.iso && `ISO ${photo.iso}`,
                    photo.shutter_speed,
                  ].filter(Boolean).join(" · ")}
                </p>
              </div>
              {photo.score && (
                <div className="text-right">
                  <span className="font-mono text-lg text-sky-600 font-medium">{photo.score}</span>
                  <span className="font-mono text-[10px] text-stone">/100</span>
                </div>
              )}
            </div>
            {photo.subject && (
              <div className="mt-3 flex items-center gap-2">
                <span className="glass-subtle rounded-full px-3 py-1 font-mono text-[10px] text-ink capitalize">{photo.subject}</span>
                {photo.date_taken && (
                  <span className="font-mono text-[10px] text-stone">
                    {new Date(photo.date_taken).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            )}
            {photo.why && (
              <p className="font-mono text-[10px] text-stone mt-2 leading-relaxed">{photo.why}</p>
            )}
            <p className="font-mono text-[9px] text-sky-500 mt-3">tap to expand</p>
          </div>
        </button>
      </div>

      {/* Expanded fullscreen view */}
      {expanded && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center animate-fade-in" onClick={() => setExpanded(false)}>
          <div className="max-w-3xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <img
              src={`/api/photos/${photo.id}/file`}
              alt={photo.file_name}
              className="w-full max-h-[70vh] object-contain rounded-2xl"
            />
            <div className="glass-strong rounded-2xl p-6 mt-4 text-center">
              <p className="font-display text-2xl">{photo.lens}</p>
              <p className="font-mono text-sm text-stone mt-1">
                {[photo.focal_length && `${photo.focal_length}mm`, photo.aperture && `f/${photo.aperture}`, photo.iso && `ISO ${photo.iso}`, photo.shutter_speed].filter(Boolean).join(" · ")}
              </p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="text-center">
                  <p className="font-display text-3xl text-sky-600">{photo.score}</p>
                  <p className="font-mono text-[9px] text-stone uppercase tracking-wider">score</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="font-display text-lg capitalize">{photo.subject}</p>
                  <p className="font-mono text-[9px] text-stone uppercase tracking-wider">subject</p>
                </div>
              </div>
              {photo.why && <p className="font-mono text-xs text-sky-300 mt-4">{photo.why}</p>}
            </div>
            <button onClick={() => setExpanded(false)} className="mt-4 mx-auto block font-mono text-xs text-white/60 hover:text-white transition-colors">
              close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
