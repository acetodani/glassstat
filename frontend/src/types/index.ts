export interface Overview {
  total_photos: number;
  date_range: { earliest: string | null; latest: string | null };
  unique_lenses: number;
  unique_bodies: number;
}

export interface FocalLengthData {
  focal_length: number;
  count: number;
}

export interface ApertureData {
  aperture: number;
  count: number;
}

export interface ISOData {
  iso: number;
  count: number;
}

export interface ShutterSpeedData {
  shutter_speed: string;
  seconds: number;
  count: number;
}

export interface TimelineData {
  period: string;
  count: number;
}

export interface TimeOfDayData {
  day: number;
  hour: number;
  count: number;
}

export interface GearUsageData {
  type: "lens" | "body";
  make: string | null;
  model: string;
  count: number;
  first_used: string | null;
  last_used: string | null;
}

export interface MapPoint {
  lat: number;
  lon: number;
  lens: string | null;
  date: string | null;
}

export interface ScanStatus {
  is_scanning: boolean;
  total_files: number;
  processed: number;
  errors: number;
  progress: number;
  current_file: string;
}
