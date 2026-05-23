import { api } from "../api/client";
import { useFetch } from "../hooks/useAnalytics";
import { Overview } from "../types";
import FocalLengthHeatmap from "./charts/FocalLengthHeatmap";
import ApertureDistribution from "./charts/ApertureDistribution";
import ShootingTimeline from "./charts/ShootingTimeline";
import ISOPatterns from "./charts/ISOPatterns";
import GearTimeline from "./charts/GearTimeline";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { data: overview, loading } = useFetch<Overview>(api.getOverview);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone font-mono text-xs mt-4">loading</p>
        </div>
      </div>
    );
  }

  if (!overview || overview.total_photos === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <p className="font-display text-6xl">0</p>
        <p className="text-stone text-sm">
          No photos scanned yet.{" "}
          <button onClick={() => navigate("/ingest")} className="text-accent underline underline-offset-2">
            Import your library
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-20 pt-8">
      {/* Hero — big dramatic number */}
      <section className="pt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10">
          <HeroStat value={overview.total_photos.toLocaleString()} label="photos" accent />
          <HeroStat value={String(overview.unique_lenses)} label="lenses" />
          <HeroStat value={String(overview.unique_bodies)} label="bodies" />
          <HeroStat
            value={
              overview.date_range.earliest
                ? `${overview.date_range.earliest.slice(0, 4)}–${overview.date_range.latest?.slice(0, 4)}`
                : "—"
            }
            label="years active"
          />
        </div>
      </section>

      {/* Focal length */}
      <section>
        <SectionHead title="Focal Length" note="where your eye gravitates" />
        <div className="bg-warm rounded-[28px] p-8 md:p-10 mt-5">
          <FocalLengthHeatmap />
        </div>
      </section>

      {/* Two col */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <SectionHead title="Aperture" note="how shallow you go" />
          <div className="bg-warm rounded-[28px] p-8 mt-5">
            <ApertureDistribution />
          </div>
        </div>
        <div>
          <SectionHead title="ISO" note="noise tolerance" />
          <div className="bg-warm rounded-[28px] p-8 mt-5">
            <ISOPatterns />
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section>
        <SectionHead title="Activity" note="shots over time" />
        <div className="bg-warm rounded-[28px] p-8 md:p-10 mt-5">
          <ShootingTimeline />
        </div>
      </section>

      {/* Gear */}
      <section>
        <SectionHead title="Your Glass" note="ranked by shutter count" />
        <div className="mt-5">
          <GearTimeline />
        </div>
      </section>
    </div>
  );
}

function HeroStat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="group">
      <p className={`font-display text-5xl md:text-7xl tracking-tight transition-colors ${accent ? "text-accent" : "text-ink group-hover:text-accent"}`}>
        {value}
      </p>
      <p className="font-mono text-[10px] text-stone uppercase tracking-[0.2em] mt-2">{label}</p>
    </div>
  );
}

function SectionHead({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
      <span className="text-stone text-sm italic">{note}</span>
    </div>
  );
}
