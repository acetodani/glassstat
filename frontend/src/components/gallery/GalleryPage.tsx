import { useState, useEffect } from "react";
import PhotoViewer from "./PhotoViewer";

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

export default function GalleryPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/photos?per_page=100")
      .then((r) => r.json())
      .then((data) => {
        setPhotos(data.photos);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center pt-24">
        <p className="font-display text-4xl">No photos yet</p>
        <p className="text-stone mt-2">Import some photos to browse them here</p>
      </div>
    );
  }

  return (
    <>
      <div className="pt-8">
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="font-display text-5xl">Library</h1>
          <span className="font-mono text-xs text-stone">{photos.length} photos</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setViewerIndex(i)}
              className="group relative aspect-[3/2] bg-warm rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform"
            >
              {/* Thumbnail — try to load actual file, fallback to placeholder */}
              <img
                src={`/api/photos/${photo.id}/file`}
                alt={photo.file_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-end p-3 opacity-0 group-hover:opacity-100">
                <div className="text-cream text-left">
                  <p className="font-mono text-[10px]">{photo.lens || "Unknown lens"}</p>
                  <p className="font-mono text-[10px] opacity-70">
                    {photo.focal_length && `${photo.focal_length}mm`}
                    {photo.aperture && ` f/${photo.aperture}`}
                    {photo.iso && ` ISO${photo.iso}`}
                  </p>
                </div>
              </div>
              {/* Fallback label when no image file */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-mono text-[10px] text-stone">{photo.file_name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Full-screen viewer */}
      {viewerIndex !== null && (
        <PhotoViewer
          photos={photos}
          currentIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
        />
      )}
    </>
  );
}
