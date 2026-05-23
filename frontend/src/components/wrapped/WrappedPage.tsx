import { useState } from "react";
import { useFetch } from "../../hooks/useAnalytics";
import { api } from "../../api/client";
import WrappedCard from "./WrappedCard";

export default function WrappedPage() {
  const [year] = useState(new Date().getFullYear());
  const { data: wrappedData, loading: wrappedLoading } = useFetch(() =>
    fetch(`/api/wrapped?year=${year}`).then((r) => r.json())
  );
  const { data: archetypeData, loading: archLoading } = useFetch(() =>
    fetch("/api/wrapped/archetype").then((r) => r.json())
  );

  if (wrappedLoading || archLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Generating your Wrapped...</div>
      </div>
    );
  }

  if (!wrappedData) return null;

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Your {year} in Photos</h2>
        <p className="text-gray-400 mt-2">Share your shooting stats with the world</p>
      </div>
      <WrappedCard data={wrappedData} archetype={archetypeData || { primary: null }} />
    </div>
  );
}
