import { useState, useEffect, useCallback, useRef } from "react";

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 30000;

export function useFetch<T>(fetcher: () => Promise<T>, cacheKey?: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    if (cacheKey) cache.delete(cacheKey);
    fetcherRef.current()
      .then((result) => {
        setData(result);
        if (cacheKey) cache.set(cacheKey, { data: result, ts: Date.now() });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [cacheKey]);

  useEffect(() => {
    // Check if we should force refresh (after upload)
    const lastRefresh = sessionStorage.getItem("glassstat_refresh");
    const shouldForce = lastRefresh && Date.now() - parseInt(lastRefresh) < 5000;

    if (cacheKey && !shouldForce) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        setData(cached.data as T);
        setLoading(false);
        return;
      }
    }

    if (shouldForce && cacheKey) {
      cache.delete(cacheKey);
      sessionStorage.removeItem("glassstat_refresh");
    }

    refetch();
  }, []);

  return { data, loading, error, refetch };
}

export function invalidateCache() {
  cache.clear();
  sessionStorage.setItem("glassstat_refresh", Date.now().toString());
}
