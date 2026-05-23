import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Onboarding() {
  const navigate = useNavigate();
  const [seeding, setSeeding] = useState(false);

  const handleDemo = async () => {
    setSeeding(true);
    await fetch("/api/demo/seed", { method: "POST" });
    sessionStorage.setItem("glassstat_refresh", Date.now().toString());
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto pt-16 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="font-display text-6xl md:text-7xl tracking-tight">
          GlassStat
        </h1>
        <p className="text-stone text-lg mt-4 max-w-md mx-auto">
          See how you really shoot. Drop your photos and discover your lens habits, patterns, and style.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
        <StepCard
          number="01"
          title="Import"
          description="Drop photos or point at a folder. We read EXIF metadata only — your files stay private."
        />
        <StepCard
          number="02"
          title="Discover"
          description="See which focal lengths you reach for, your aperture habits, and shooting patterns."
        />
        <StepCard
          number="03"
          title="Share"
          description="Generate your Wrapped card and find out your photographer archetype."
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => navigate("/ingest")}
          className="glass-strong rounded-2xl px-8 py-4 text-sm font-medium hover:shadow-md transition-all hover:scale-[1.02] w-full sm:w-auto text-center"
        >
          Import your photos
        </button>
        <button
          onClick={handleDemo}
          disabled={seeding}
          className="glass-subtle rounded-2xl px-8 py-4 text-sm text-stone hover:text-ink transition-all hover:scale-[1.02] w-full sm:w-auto text-center disabled:opacity-50"
        >
          {seeding ? "Loading demo..." : "Try with demo data"}
        </button>
      </div>

      {/* Supported formats */}
      <div className="mt-16 text-center">
        <p className="font-mono text-[10px] text-sand uppercase tracking-widest mb-3">supports</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["CR3", "NEF", "ARW", "DNG", "RAF", "HEIF", "JPEG", "TIFF"].map((fmt) => (
            <span key={fmt} className="glass-subtle rounded-lg px-3 py-1.5 font-mono text-xs text-stone">
              {fmt}
            </span>
          ))}
        </div>
        <p className="text-stone text-xs mt-3">Canon, Nikon, Sony, Fuji, and 400+ more formats</p>
      </div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="glass rounded-3xl p-6 shadow-sm">
      <span className="font-mono text-xs text-accent">{number}</span>
      <h3 className="font-display text-xl mt-2">{title}</h3>
      <p className="text-stone text-sm mt-2 leading-relaxed">{description}</p>
    </div>
  );
}
