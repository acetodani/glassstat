import { useEffect, useState } from "react";
import { ScanStatus } from "../../types";
import { useNavigate } from "react-router-dom";

export default function ScanProgress({ status }: { status: ScanStatus }) {
  const navigate = useNavigate();
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const pct = Math.round(status.progress * 100);
  const done = !status.is_scanning && status.processed > 0;

  useEffect(() => {
    if (done) {
      const timeout = setTimeout(() => navigate("/gallery"), 1500);
      return () => clearTimeout(timeout);
    }
  }, [done, navigate]);

  return (
    <div className="max-w-lg mx-auto pt-24 text-center">
      {/* Big animated number */}
      <div className="relative">
        <p className="font-display text-[120px] leading-none tracking-tight tabular-nums">
          {status.processed.toLocaleString()}
        </p>
        <p className="font-mono text-xs text-stone uppercase tracking-widest mt-2">
          {done ? "photos scanned" : `of ${status.total_files.toLocaleString()} photos`}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-12 mx-auto max-w-xs">
        <div className="w-full h-2 bg-warm rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${pct}%`,
              backgroundColor: done ? "#22c55e" : "#E8553D",
            }}
          />
        </div>
        <div className="flex justify-between mt-3">
          <span className="font-mono text-xs text-stone">{pct}%</span>
          {status.errors > 0 && (
            <span className="font-mono text-xs text-accent">{status.errors} skipped</span>
          )}
        </div>
      </div>

      {/* Current file */}
      {status.current_file && !done && (
        <p className="mt-8 font-mono text-xs text-stone truncate max-w-sm mx-auto">
          reading {status.current_file}{dots}
        </p>
      )}

      {/* Done state */}
      {done && (
        <div className="mt-12 animate-fade-in">
          <p className="font-display text-2xl">Done</p>
          <p className="text-stone text-sm mt-1">redirecting to dashboard...</p>
        </div>
      )}
    </div>
  );
}
