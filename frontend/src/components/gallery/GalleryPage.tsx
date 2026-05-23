import { useState, useEffect } from "react";
import PhotoViewer from "./PhotoViewer";

interface PhotoItem {
  id: number;
  file_name: string;
  file_path: string;
  file_format: string;
  camera: string | null;
  lens: string | null;
  focal_length: number | null;
  aperture: number | null;
  shutter_speed: string | null;
  iso: number | null;
  date_taken: string | null;
  width: number | null;
  height: number | null;
  has_file: boolean;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/photos/?per_page=200")
      .then((r) => r.json())
      .then((data) => {
        setPhotos(data.photos);
        setTotal(data.total);
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
          <span className="font-mono text-xs text-stone">{total.toLocaleString()} photos</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setViewerIndex(i)}
              className="group relative aspect-[3/2] bg-warm rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-200"
            >
              {photo.has_file ? (
                <img
                  src={`/api/photos/${photo.id}/file`}
                  alt={photo.file_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3">
                  <span className="font-mono text-xs text-stone text-center truncate w-full">{photo.file_name}</span>
                  <span className="font-mono text-[10px] text-sand">{photo.file_format}</span>
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/50 transition-colors duration-200 flex items-end p-3 opacity-0 group-hover:opacity-100">
                <div className="text-cream text-left">
                  <p className="font-mono text-[11px] font-medium">{photo.lens || photo.file_name}</p>
                  <p className="font-mono text-[10px] opacity-80 mt-0.5">
                    {[
                      photo.focal_length && `${photo.focal_length}mm`,
                      photo.aperture && `f/${photo.aperture}`,
                      photo.iso && `ISO ${photo.iso}`,
                    ].filter(Boolean).join("  ")}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

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
