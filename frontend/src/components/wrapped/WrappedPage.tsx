import { useState } from "react";
import { useFetch } from "../../hooks/useAnalytics";
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
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-stone font-mono text-sm">generating your wrapped...</p>
      </div>
    );
  }

  if (!wrappedData) return null;

  return (
    <div className="max-w-md mx-auto pt-12">
      <div className="text-center mb-12">
        <h1 className="font-display text-5xl">{year}</h1>
        <p className="text-stone mt-2">your year in photos</p>
      </div>
      <WrappedCard data={wrappedData} archetype={archetypeData || { primary: null }} />
    </div>
  );
}
