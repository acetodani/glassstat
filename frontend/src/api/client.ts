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

export interface DashboardData {
  stats: {
    total_photos: number;
    unique_lenses: number;
    unique_bodies: number;
    date_range: { earliest: string | null; latest: string | null };
  };
  recent_photos: {
    id: number;
    file_name: string;
    lens: string | null;
    focal_length: number | null;
    aperture: number | null;
    iso: number | null;
    has_file: boolean;
  }[];
  top_gear: { lens: string; count: number }[];
  focal_length: { focal_length: number; count: number }[];
  activity: { period: string; count: number }[];
}

export interface PhotoListResponse {
  photos: PhotoItem[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PhotoItem {
  id: number;
  file_name: string;
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

export const api = {
  // Single bundled dashboard call
  getDashboard: () => request<DashboardData>("/dashboard/"),

  // Paginated photo list with filters
  getPhotos: (page = 1, perPage = 50, filters?: { lens?: string; camera?: string }) => {
    let url = `/photos/?page=${page}&per_page=${perPage}`;
    if (filters?.lens) url += `&lens=${encodeURIComponent(filters.lens)}`;
    if (filters?.camera) url += `&camera=${encodeURIComponent(filters.camera)}`;
    return request<PhotoListResponse>(url);
  },

  // Individual analytics (used by Wrapped page)
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
      (r) => r.json() as Promise<{ message: string; total: number; skipped: string[] }>
    );
  },
};
