import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { api, PhotoItem } from "../../api/client";
import PhotoViewer from "./PhotoViewer";

interface Filters {
  lenses: { name: string; count: number }[];
  cameras: { name: string; count: number }[];
}

export default function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const lensFilter = searchParams.get("lens") || undefined;
  const cameraFilter = searchParams.get("camera") || undefined;

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const observerRef = useRef<HTMLDivElement>(null);

  // Load filters
  useEffect(() => {
    fetch("/api/photos/filters").then((r) => r.json()).then(setFilters);
  }, []);

  // Load photos
  useEffect(() => {
    setPhotos([]);
    setPage(1);
    setLoading(true);
    api.getPhotos(1, 24, { lens: lensFilter, camera: cameraFilter }).then((data) => {
      setPhotos(data.photos);
      setTotalPages(data.total_pages);
      setTotal(data.total);
      setLoading(false);
    });
    sessionStorage.removeItem("glassstat_refresh");
  }, [lensFilter, cameraFilter]);

  const loadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    api.getPhotos(nextPage, 24, { lens: lensFilter, camera: cameraFilter }).then((data) => {
      setPhotos((prev) => [...prev, ...data.photos]);
      setPage(nextPage);
      setLoadingMore(false);
    });
  }, [page, totalPages, loadingMore, lensFilter, cameraFilter]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});
  const hasActiveFilter = lensFilter || cameraFilter;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="pt-8">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="font-display text-5xl">Library</h1>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-stone">{total.toLocaleString()} photos</span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`glass rounded-xl px-3 py-1.5 font-mono text-xs transition-all ${showFilters || hasActiveFilter ? "text-sky-600 shadow-sm" : "text-stone hover:text-ink"}`}
            >
              {hasActiveFilter ? "filtered" : "filter"}
            </button>
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && filters && (
          <div className="glass rounded-2xl p-4 mb-6 animate-fade-in">
            <div className="flex flex-wrap gap-2">
              {hasActiveFilter && (
                <button onClick={clearFilters} className="rounded-full px-3 py-1.5 text-xs font-mono bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                  clear all
                </button>
              )}

              {/* Lens filters */}
              {filters.lenses.slice(0, 6).map((l) => (
                <button
                  key={l.name}
                  onClick={() => setFilter("lens", lensFilter === l.name ? null : l.name)}
                  className={`rounded-full px-3 py-1.5 text-xs font-mono transition-all ${
                    lensFilter === l.name
                      ? "bg-sky-100 text-sky-700 shadow-sm"
                      : "glass-subtle text-stone hover:text-ink"
                  }`}
                >
                  {l.name} <span className="opacity-50">({l.count})</span>
                </button>
              ))}

              {/* Camera filters */}
              {filters.cameras.slice(0, 4).map((c) => (
                <button
                  key={c.name}
                  onClick={() => setFilter("camera", cameraFilter === c.name ? null : c.name)}
                  className={`rounded-full px-3 py-1.5 text-xs font-mono transition-all ${
                    cameraFilter === c.name
                      ? "bg-orange-100 text-orange-700 shadow-sm"
                      : "glass-subtle text-stone hover:text-ink"
                  }`}
                >
                  {c.name} <span className="opacity-50">({c.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active filter pills */}
        {hasActiveFilter && !showFilters && (
          <div className="flex gap-2 mb-4">
            {lensFilter && (
              <button onClick={() => setFilter("lens", null)} className="rounded-full px-3 py-1.5 text-xs font-mono bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors">
                {lensFilter} ×
              </button>
            )}
            {cameraFilter && (
              <button onClick={() => setFilter("camera", null)} className="rounded-full px-3 py-1.5 text-xs font-mono bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors">
                {cameraFilter} ×
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {photos.length === 0 && (
          <div className="text-center pt-16">
            <p className="font-display text-3xl">No photos match</p>
            <p className="text-stone mt-2">Try removing a filter</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, i) => (
            <button
              key={`${photo.id}-${i}`}
              onClick={() => setViewerIndex(i)}
              className="group relative aspect-[3/2] bg-white/30 rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-200 animate-pop-in"
              style={{ animationDelay: `${(i % 24) * 25}ms` }}
            >
              {photo.has_file ? (
                <img src={`/api/photos/${photo.id}/thumb`} alt={photo.file_name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-3">
                  <span className="font-mono text-xs text-stone truncate w-full text-center">{photo.file_name}</span>
                  <span className="font-mono text-[10px] text-slate-400">{photo.file_format}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-end p-3 opacity-0 group-hover:opacity-100">
                <div className="text-white text-left">
                  <p className="font-mono text-[11px] font-medium">{photo.lens || photo.file_name}</p>
                  <p className="font-mono text-[10px] opacity-80 mt-0.5">
                    {[photo.focal_length && `${photo.focal_length}mm`, photo.aperture && `f/${photo.aperture}`, photo.iso && `ISO ${photo.iso}`].filter(Boolean).join("  ")}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Scroll trigger */}
        <div ref={observerRef} className="h-20 flex items-center justify-center">
          {loadingMore && <div className="w-6 h-6 border-2 border-stone border-t-transparent rounded-full animate-spin" />}
          {page >= totalPages && photos.length > 0 && <span className="font-mono text-xs text-slate-400">end of library</span>}
        </div>
      </div>

      {viewerIndex !== null && (
        <PhotoViewer photos={photos} currentIndex={viewerIndex} onClose={() => setViewerIndex(null)} onNavigate={setViewerIndex} />
      )}
    </>
  );
}
