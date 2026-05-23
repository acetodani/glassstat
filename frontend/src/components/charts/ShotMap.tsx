import { api } from "../../api/client";
import { useFetch } from "../../hooks/useAnalytics";
import { MapPoint } from "../../types";

export default function ShotMap() {
  const { data, loading } = useFetch<MapPoint[]>(api.getMapData);

  if (loading || !data) return <div className="h-96 animate-pulse bg-gray-800 rounded" />;

  if (data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500">
        No GPS data found in your photos
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border border-gray-700">
      <p className="text-center text-gray-400 p-4">
        Map visualization — {data.length.toLocaleString()} geotagged photos
      </p>
    </div>
  );
}
