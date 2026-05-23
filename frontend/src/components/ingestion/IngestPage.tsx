import { useState, useEffect } from "react";
import FolderScan from "./FolderScan";
import DragDropUpload from "./DragDropUpload";
import ScanProgress from "./ScanProgress";
import { ScanStatus } from "../../types";

export default function IngestPage() {
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState<ScanStatus | null>(null);

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/ingest/status");
        const data: ScanStatus = await res.json();
        setStatus(data);
        if (!data.is_scanning && data.processed > 0) {
          setScanning(false);
        }
      } catch {
        // ignore
      }
    }, 400);
    return () => clearInterval(interval);
  }, [scanning]);

  if (scanning && status) {
    return <ScanProgress status={status} />;
  }

  return (
    <div className="max-w-xl mx-auto pt-12 space-y-12">
      <div>
        <h1 className="font-display text-5xl">Import</h1>
        <p className="text-stone mt-3">
          Point at your photo folder, or drop some files.
        </p>
      </div>
      <FolderScan onScanStart={() => setScanning(true)} />
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-sand" />
        <span className="text-stone text-xs font-mono">or</span>
        <div className="flex-1 h-px bg-sand" />
      </div>
      <DragDropUpload onUploadStart={() => setScanning(true)} />
    </div>
  );
}
