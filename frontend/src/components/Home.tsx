import { useNavigate } from "react-router-dom";
import { api, DashboardData } from "../api/client";
import { useFetch } from "../hooks/useAnalytics";

export default function Home() {
  const { data } = useFetch<DashboardData>(api.getDashboard, "dashboard");
  const navigate = useNavigate();
  const hasPhotos = data && data.stats.total_photos > 0;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-fade-in">
      {/* Logo / Title */}
      <div className="mb-12">
        <h1 className="font-display text-7xl md:text-8xl tracking-tight">
          Glass<span className="text-accent">Stat</span>
        </h1>
        <p className="text-stone text-lg mt-4 max-w-sm mx-auto leading-relaxed">
          Know your glass. See how you really shoot.
        </p>
      </div>

      {/* Quick stats if they have data */}
      {hasPhotos && (
        <div className="glass rounded-3xl px-10 py-6 mb-10 flex gap-10 items-baseline animate-pop-in">
          <div className="text-center">
            <p className="font-display text-3xl text-accent">{data.stats.total_photos.toLocaleString()}</p>
            <p className="font-mono text-[9px] text-stone uppercase tracking-widest mt-1">photos</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl">{data.stats.unique_lenses}</p>
            <p className="font-mono text-[9px] text-stone uppercase tracking-widest mt-1">lenses</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl">{data.stats.unique_bodies}</p>
            <p className="font-mono text-[9px] text-stone uppercase tracking-widest mt-1">bodies</p>
          </div>
        </div>
      )}

      {/* Navigation cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
        {hasPhotos && (
          <>
            <NavCard onClick={() => navigate("/overview")} title="Overview" subtitle="Stats & charts" />
            <NavCard onClick={() => navigate("/gallery")} title="Library" subtitle="Browse photos" />
            <NavCard onClick={() => navigate("/wrapped")} title="Wrapped" subtitle="Your year" />
          </>
        )}
        <NavCard
          onClick={() => navigate("/ingest")}
          title="Import"
          subtitle={hasPhotos ? "Add more" : "Get started"}
          accent={!hasPhotos}
        />
      </div>

      {/* How it works — only when empty */}
      {!hasPhotos && (
        <div className="mt-16 max-w-lg">
          <p className="font-mono text-[10px] text-stone uppercase tracking-widest mb-6">how it works</p>
          <div className="grid grid-cols-3 gap-4">
            <Step n="01" text="Drop your photos or point at a folder" />
            <Step n="02" text="We read EXIF metadata — files stay private" />
            <Step n="03" text="See your shooting patterns instantly" />
          </div>
          <div className="mt-10">
            <p className="font-mono text-[10px] text-stone uppercase tracking-widest mb-3">supports 400+ formats</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {["CR3", "NEF", "ARW", "DNG", "RAF", "ORF", "HEIF", "JPEG"].map((f) => (
                <span key={f} className="glass-subtle rounded-md px-2.5 py-1 font-mono text-[10px] text-stone">{f}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavCard({ onClick, title, subtitle, accent }: { onClick: () => void; title: string; subtitle: string; accent?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`glass rounded-2xl p-5 text-left hover:scale-[1.03] transition-all hover:shadow-md ${accent ? "ring-2 ring-accent/30" : ""}`}
    >
      <p className={`font-display text-lg ${accent ? "text-accent" : ""}`}>{title}</p>
      <p className="font-mono text-[10px] text-stone mt-1">{subtitle}</p>
    </button>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <div className="text-center">
      <span className="font-mono text-xs text-accent">{n}</span>
      <p className="text-stone text-xs mt-1 leading-relaxed">{text}</p>
    </div>
  );
}
