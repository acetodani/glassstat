import { useEffect, useCallback } from "react";

interface PhotoItem {
  id: number;
  file_name: string;
  file_path: string;
  camera: string | null;
  lens: string | null;
  focal_length: number | null;
  aperture: number | null;
  shutter_speed: string | null;
  iso: number | null;
  date_taken: string | null;
  width: number | null;
  height: number | null;
}

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

  // Touch swipe
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
    <div className="fixed inset-0 z-50 bg-cream/95 backdrop-blur-sm animate-fade-in">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-warm hover:bg-sand transition-colors"
      >
        <span className="text-lg">&times;</span>
      </button>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-warm hover:bg-sand transition-colors"
        >
          <span className="text-xl">&larr;</span>
        </button>
      )}
      {hasNext && (
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-warm hover:bg-sand transition-colors"
        >
          <span className="text-xl">&rarr;</span>
        </button>
      )}

      {/* Main content */}
      <div className="h-full flex flex-col md:flex-row items-center justify-center p-6 gap-8">
        {/* Image */}
        <div className="flex-1 flex items-center justify-center max-h-[70vh] md:max-h-[80vh]">
          <img
            src={`/api/photos/${photo.id}/file`}
            alt={photo.file_name}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* EXIF panel */}
        <div className="w-full md:w-72 animate-slide-up">
          <div className="bg-warm rounded-[24px] p-6 space-y-5">
            <div>
              <p className="font-mono text-[10px] text-stone uppercase tracking-widest">file</p>
              <p className="font-sans text-sm font-medium mt-1 truncate">{photo.file_name}</p>
            </div>

            {photo.lens && (
              <div>
                <p className="font-mono text-[10px] text-stone uppercase tracking-widest">lens</p>
                <p className="font-display text-xl mt-1">{photo.lens}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {photo.focal_length && (
                <ExifStat label="focal" value={`${photo.focal_length}mm`} />
              )}
              {photo.aperture && (
                <ExifStat label="aperture" value={`f/${photo.aperture}`} />
              )}
              {photo.shutter_speed && (
                <ExifStat label="shutter" value={photo.shutter_speed} />
              )}
              {photo.iso && (
                <ExifStat label="iso" value={String(photo.iso)} />
              )}
            </div>

            {photo.camera && (
              <div>
                <p className="font-mono text-[10px] text-stone uppercase tracking-widest">camera</p>
                <p className="font-sans text-sm mt-1">{photo.camera}</p>
              </div>
            )}

            {photo.date_taken && (
              <div>
                <p className="font-mono text-[10px] text-stone uppercase tracking-widest">date</p>
                <p className="font-sans text-sm mt-1">{new Date(photo.date_taken).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                })}</p>
              </div>
            )}

            {photo.width && photo.height && (
              <div>
                <p className="font-mono text-[10px] text-stone uppercase tracking-widest">resolution</p>
                <p className="font-sans text-sm mt-1">{photo.width} &times; {photo.height}</p>
              </div>
            )}

            {/* Counter */}
            <div className="pt-4 border-t border-sand flex justify-between items-center">
              <span className="font-mono text-xs text-stone">
                {currentIndex + 1} / {photos.length}
              </span>
              <span className="font-mono text-[10px] text-sand">
                arrows or swipe
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExifStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] text-stone uppercase tracking-widest">{label}</p>
      <p className="font-display text-lg mt-0.5">{value}</p>
    </div>
  );
}
