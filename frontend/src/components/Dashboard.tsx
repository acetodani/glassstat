import { api } from "../api/client";
import { useFetch } from "../hooks/useAnalytics";
import { Overview, FocalLengthData, GearUsageData, TimeOfDayData } from "../types";
import FocalLengthHeatmap from "./charts/FocalLengthHeatmap";
import ApertureDistribution from "./charts/ApertureDistribution";
import ShootingTimeline from "./charts/ShootingTimeline";
import ISOPatterns from "./charts/ISOPatterns";
import GearTimeline from "./charts/GearTimeline";
import { Camera, Aperture, Clock, Image } from "lucide-react";

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-glass-400" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { data: overview, loading } = useFetch<Overview>(api.getOverview);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (!overview || overview.total_photos === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Camera className="w-16 h-16 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-300">No photos scanned yet</h2>
        <p className="text-gray-500">Head to Import to scan your photo library</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Image} label="Total Photos" value={overview.total_photos.toLocaleString()} />
        <StatCard icon={Aperture} label="Lenses Used" value={overview.unique_lenses} />
        <StatCard icon={Camera} label="Camera Bodies" value={overview.unique_bodies} />
        <StatCard icon={Clock} label="Date Range" value={
          overview.date_range.earliest
            ? `${overview.date_range.earliest.slice(0, 4)}–${overview.date_range.latest?.slice(0, 4)}`
            : "N/A"
        } />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Focal Length Distribution</h3>
          <FocalLengthHeatmap />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Aperture Usage</h3>
          <ApertureDistribution />
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Shooting Timeline</h3>
        <ShootingTimeline />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">ISO Patterns</h3>
          <ISOPatterns />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Gear Usage</h3>
          <GearTimeline />
        </div>
      </div>
    </div>
  );
}
