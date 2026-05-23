const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}

export const api = {
  getOverview: () => request("/analytics/overview"),
  getFocalLength: () => request("/analytics/focal-length"),
  getAperture: (lens?: string) =>
    request(`/analytics/aperture${lens ? `?lens=${encodeURIComponent(lens)}` : ""}`),
  getISO: () => request("/analytics/iso"),
  getShutterSpeed: () => request("/analytics/shutter-speed"),
  getTimeline: (granularity = "monthly") =>
    request(`/analytics/timeline?granularity=${granularity}`),
  getTimeOfDay: () => request("/analytics/time-of-day"),
  getGearUsage: () => request("/analytics/gear-usage"),
  getMapData: () => request("/analytics/map"),
  getScanStatus: () => request("/analytics/status"),
  startScan: (directory: string) =>
    request(`/ingest/scan?directory=${encodeURIComponent(directory)}`, {
      method: "POST",
    }),
  uploadFiles: (files: FileList) => {
    const form = new FormData();
    for (const file of files) {
      form.append("files", file);
    }
    return fetch(`${BASE}/ingest/upload`, { method: "POST", body: form }).then(
      (r) => r.json()
    );
  },
};
