import { api } from "../api/client";
import { useFetch } from "../hooks/useAnalytics";
import { Overview } from "../types";
import FocalLengthHeatmap from "./charts/FocalLengthHeatmap";
import ApertureDistribution from "./charts/ApertureDistribution";
import ShootingTimeline from "./charts/ShootingTimeline";
import ISOPatterns from "./charts/ISOPatterns";
import GearTimeline from "./charts/GearTimeline";

export default function Dashboard() {
  const { data: overview, loading } = useFetch<Overview>(api.getOverview);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-stone font-mono text-sm">loading...</p>
      </div>
    );
  }

  if (!overview || overview.total_photos === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <p className="font-display text-4xl">No photos yet</p>
        <p className="text-stone text-sm">Import your library to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pt-8">
      {/* Hero stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <Stat label="total photos" value={overview.total_photos.toLocaleString()} />
        <Stat label="lenses" value={String(overview.unique_lenses)} />
        <Stat label="bodies" value={String(overview.unique_bodies)} />
        <Stat
          label="years"
          value={
            overview.date_range.earliest
              ? `${overview.date_range.earliest.slice(0, 4)}–${overview.date_range.latest?.slice(0, 4)}`
              : "—"
          }
        />
      </section>

      {/* Focal length — full width, big */}
      <section>
        <SectionHeader title="Focal Length" subtitle="where your eye goes" />
        <div className="bg-warm rounded-3xl p-8 mt-4">
          <FocalLengthHeatmap />
        </div>
      </section>

      {/* Two-col: Aperture + ISO */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHeader title="Aperture" subtitle="depth of field habits" />
          <div className="bg-warm rounded-3xl p-8 mt-4">
            <ApertureDistribution />
          </div>
        </div>
        <div>
          <SectionHeader title="ISO" subtitle="how much noise you tolerate" />
          <div className="bg-warm rounded-3xl p-8 mt-4">
            <ISOPatterns />
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section>
        <SectionHeader title="Timeline" subtitle="when you shoot" />
        <div className="bg-warm rounded-3xl p-8 mt-4">
          <ShootingTimeline />
        </div>
      </section>

      {/* Gear */}
      <section>
        <SectionHeader title="Your Glass" subtitle="ranked by usage" />
        <div className="mt-4">
          <GearTimeline />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-5xl md:text-6xl tracking-tight">{value}</p>
      <p className="text-stone text-xs font-mono uppercase tracking-widest mt-2">{label}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <h2 className="font-display text-3xl">{title}</h2>
      <span className="text-stone text-sm">{subtitle}</span>
    </div>
  );
}
