import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { api, PhotoItem } from "../../api/client";
import PhotoViewer from "./PhotoViewer";

export default function GalleryPage() {
  const [searchParams] = useSearchParams();
  const lensFilter = searchParams.get("lens") || undefined;

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const observerRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    setPhotos([]);
    setPage(1);
    setLoading(true);
    api.getPhotos(1, 50, lensFilter).then((data) => {
      setPhotos(data.photos);
      setTotalPages(data.total_pages);
      setTotal(data.total);
      setLoading(false);
    });
  }, [lensFilter]);

  // Infinite scroll - load more
  const loadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    api.getPhotos(nextPage, 50, lensFilter).then((data) => {
      setPhotos((prev) => [...prev, ...data.photos]);
      setPage(nextPage);
      setLoadingMore(false);
    });
  }, [page, totalPages, loadingMore, lensFilter]);

  // IntersectionObserver for infinite scroll trigger
  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

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
          <div className="flex items-baseline gap-4">
            <h1 className="font-display text-5xl">Library</h1>
            {lensFilter && (
              <span className="font-mono text-xs text-accent bg-accent/10 px-3 py-1 rounded-full">
                {lensFilter}
              </span>
            )}
          </div>
          <span className="font-mono text-xs text-stone">{total.toLocaleString()} photos</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, i) => (
            <button
              key={`${photo.id}-${i}`}
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
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-3">
                  <span className="font-mono text-xs text-stone text-center truncate w-full">{photo.file_name}</span>
                  <span className="font-mono text-[10px] text-sand">{photo.file_format}</span>
                </div>
              )}
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

        {/* Infinite scroll trigger */}
        <div ref={observerRef} className="h-20 flex items-center justify-center">
          {loadingMore && (
            <div className="w-6 h-6 border-2 border-stone border-t-transparent rounded-full animate-spin" />
          )}
          {page >= totalPages && photos.length > 0 && (
            <span className="font-mono text-xs text-sand">end of library</span>
          )}
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
