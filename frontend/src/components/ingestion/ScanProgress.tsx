import { useEffect, useState } from "react";
import { ScanStatus } from "../../types";

export default function ScanProgress({ status }: { status: ScanStatus }) {
  const [dots, setDots] = useState("");
  const [startTime] = useState(Date.now());
  const [eta, setEta] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status.processed > 0 && status.is_scanning) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = status.processed / elapsed;
      const remaining = (status.total_files - status.processed) / rate;
      if (remaining < 60) {
        setEta(`~${Math.ceil(remaining)}s remaining`);
      } else {
        setEta(`~${Math.ceil(remaining / 60)}min remaining`);
      }
    }
  }, [status.processed, status.total_files, status.is_scanning, startTime]);

  const pct = Math.round(status.progress * 100);
  const done = !status.is_scanning && status.processed > 0;

  return (
    <div className="max-w-lg mx-auto pt-24 text-center animate-fade-in">
      <div className="glass-strong rounded-[32px] p-12 shadow-lg">
        {/* Big number */}
        <p className="font-display text-[100px] leading-none tracking-tight tabular-nums">
          {status.processed.toLocaleString()}
        </p>
        <p className="font-mono text-xs text-stone uppercase tracking-widest mt-3">
          {done ? "photos scanned" : `of ${status.total_files.toLocaleString()}`}
        </p>

        {/* Progress bar */}
        <div className="mt-10 mx-auto max-w-xs">
          <div className="w-full h-2.5 bg-white/40 rounded-full overflow-hidden">
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
            {eta && !done && <span className="font-mono text-xs text-stone">{eta}</span>}
            {status.errors > 0 && (
              <span className="font-mono text-xs text-accent">{status.errors} skipped</span>
            )}
          </div>
        </div>

        {/* Current file */}
        {status.current_file && !done && (
          <p className="mt-8 font-mono text-xs text-stone truncate max-w-sm mx-auto">
            {status.current_file}{dots}
          </p>
        )}

        {/* Done */}
        {done && (
          <div className="mt-8">
            <p className="font-display text-2xl text-green-700">Done</p>
          </div>
        )}
      </div>
    </div>
  );
}
