import { useEffect, useCallback } from "react";
import { PhotoItem } from "../../api/client";

interface Props {
  photos: PhotoItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function PhotoViewer({ photos, currentIndex, onClose, onNavigate }: Props) {
  const photo = photos[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1);
  }, [currentIndex, hasPrev, onNavigate]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1);
  }, [currentIndex, hasNext, onNavigate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goPrev, goNext]);

  useEffect(() => {
    let startX = 0;
    const handleStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const handleEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (diff > 60) goNext();
      if (diff < -60) goPrev();
    };
    window.addEventListener("touchstart", handleStart);
    window.addEventListener("touchend", handleEnd);
    return () => {
      window.removeEventListener("touchstart", handleStart);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [goPrev, goNext]);

  return (
    <div className="fixed inset-0 z-50 bg-cream/98 backdrop-blur-md animate-fade-in">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-warm hover:bg-sand transition-colors text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 2L14 14M14 2L2 14" />
        </svg>
      </button>

      {hasPrev && (
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-warm hover:bg-sand transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 4L6 10L12 16" />
          </svg>
        </button>
      )}
      {hasNext && (
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-warm hover:bg-sand transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 4L14 10L8 16" />
          </svg>
        </button>
      )}

      <div className="h-full flex flex-col md:flex-row items-center justify-center p-8 md:p-12 gap-8">
        <div className="flex-1 flex items-center justify-center h-full">
          {photo.has_file ? (
            <img
              key={photo.id}
              src={`/api/photos/${photo.id}/file`}
              alt={photo.file_name}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-xl animate-fade-in"


            />
          ) : (
            <div className="w-80 h-56 bg-warm rounded-2xl flex flex-col items-center justify-center gap-3">
              <p className="font-mono text-sm text-stone">{photo.file_name}</p>
              <p className="font-mono text-xs text-sand">preview not available</p>
            </div>
          )}
        </div>

        <div className="w-full md:w-80 shrink-0 animate-slide-up">
          <div className="bg-warm rounded-[24px] p-7 space-y-5">
            <div>
              <p className="font-mono text-[10px] text-stone uppercase tracking-[0.15em]">file</p>
              <p className="font-sans text-sm font-medium mt-1 truncate">{photo.file_name}</p>
            </div>

            {photo.lens && (
              <div className="py-3 border-y border-sand">
                <p className="font-mono text-[10px] text-stone uppercase tracking-[0.15em]">lens</p>
                <p className="font-display text-2xl mt-1 leading-tight">{photo.lens}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {photo.focal_length != null && <ExifStat label="focal" value={`${photo.focal_length}mm`} />}
              {photo.aperture != null && <ExifStat label="aperture" value={`f/${photo.aperture}`} />}
              {photo.shutter_speed && <ExifStat label="shutter" value={photo.shutter_speed} />}
              {photo.iso != null && <ExifStat label="iso" value={String(photo.iso)} />}
              {photo.width && photo.height && <ExifStat label="size" value={`${photo.width}×${photo.height}`} />}
              {photo.file_format && <ExifStat label="format" value={photo.file_format} />}
            </div>

            {photo.camera && (
              <div>
                <p className="font-mono text-[10px] text-stone uppercase tracking-[0.15em]">camera</p>
                <p className="font-sans text-sm mt-1">{photo.camera}</p>
              </div>
            )}

            {photo.date_taken && (
              <div>
                <p className="font-mono text-[10px] text-stone uppercase tracking-[0.15em]">taken</p>
                <p className="font-sans text-sm mt-1">
                  {new Date(photo.date_taken).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {/* Auto-insight */}
            <div className="pt-4 border-t border-sand">
              <p className="font-mono text-[10px] text-stone leading-relaxed">
                {generateInsight(photo)}
              </p>
            </div>

            <div className="pt-3 flex justify-between items-center">
              <span className="font-mono text-xs text-stone tabular-nums">{currentIndex + 1} / {photos.length}</span>
              <span className="font-mono text-[9px] text-sand uppercase tracking-wider">keys / swipe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateInsight(photo: PhotoItem): string {
  const parts: string[] = [];
  const fl = photo.focal_length;
  const ap = photo.aperture;
  const iso = photo.iso;
  const hour = photo.date_taken ? new Date(photo.date_taken).getHours() : null;

  if (fl && ap) {
    if (fl >= 70 && fl <= 135 && ap <= 2.8) parts.push("Portrait-style isolation");
    else if (fl <= 35 && ap >= 8) parts.push("Landscape depth");
    else if (fl >= 200) parts.push("Telephoto reach");
    else if (fl >= 28 && fl <= 55 && ap <= 4) parts.push("Classic street focal length");
  }

  if (iso && iso <= 200) parts.push("clean sensor");
  else if (iso && iso >= 3200) parts.push("pushed in low light");

  if (hour !== null) {
    if ((hour >= 6 && hour <= 8) || (hour >= 17 && hour <= 19)) parts.push("golden hour");
    else if (hour >= 21 || hour <= 4) parts.push("night shot");
  }

  if (ap && ap <= 1.8) parts.push("wide open bokeh");
  else if (ap && ap >= 8 && ap <= 11) parts.push("sweet spot sharpness");

  if (parts.length === 0) return "Standard exposure settings";
  return parts.join(" · ");
}

function ExifStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] text-stone uppercase tracking-[0.15em]">{label}</p>
      <p className="font-display text-xl leading-tight mt-0.5">{value}</p>
    </div>
  );
}
