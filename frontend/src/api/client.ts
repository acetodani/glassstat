import type {
  Overview,
  FocalLengthData,
  ApertureData,
  ISOData,
  ShutterSpeedData,
  TimelineData,
  TimeOfDayData,
  GearUsageData,
  MapPoint,
  ScanStatus,
} from "../types";

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
  return res.json() as Promise<T>;
}

export const api = {
  getOverview: () => request<Overview>("/analytics/overview"),
  getFocalLength: () => request<FocalLengthData[]>("/analytics/focal-length"),
  getAperture: (lens?: string) =>
    request<ApertureData[]>(`/analytics/aperture${lens ? `?lens=${encodeURIComponent(lens)}` : ""}`),
  getISO: () => request<ISOData[]>("/analytics/iso"),
  getShutterSpeed: () => request<ShutterSpeedData[]>("/analytics/shutter-speed"),
  getTimeline: (granularity = "monthly") =>
    request<TimelineData[]>(`/analytics/timeline?granularity=${granularity}`),
  getTimeOfDay: () => request<TimeOfDayData[]>("/analytics/time-of-day"),
  getGearUsage: () => request<GearUsageData[]>("/analytics/gear-usage"),
  getMapData: () => request<MapPoint[]>("/analytics/map"),
  getScanStatus: () => request<ScanStatus>("/ingest/status"),
  startScan: (directory: string) =>
    request<{ message: string; total?: number }>(`/ingest/scan?directory=${encodeURIComponent(directory)}`, {
      method: "POST",
    }),
  uploadFiles: (files: FileList) => {
    const form = new FormData();
    for (const file of files) {
      form.append("files", file);
    }
    return fetch(`${BASE}/ingest/upload`, { method: "POST", body: form }).then(
      (r) => r.json() as Promise<{ message: string }>
    );
  },
};
