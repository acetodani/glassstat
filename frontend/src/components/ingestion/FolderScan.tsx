import { useState } from "react";
import { api } from "../../api/client";

export default function FolderScan() {
  const [directory, setDirectory] = useState("");
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");

  const handleScan = async () => {
    if (!directory.trim()) return;
    setScanning(true);
    setMessage("");
    try {
      const result = await api.startScan(directory.trim()) as { message: string };
      setMessage(result.message);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="bg-warm rounded-3xl p-8">
      <p className="font-mono text-xs text-stone uppercase tracking-widest mb-4">
        directory scan
      </p>
      <div className="flex gap-3">
        <input
          type="text"
          value={directory}
          onChange={(e) => setDirectory(e.target.value)}
          placeholder="/Users/you/Photos"
          className="flex-1 bg-cream border border-sand rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-ink transition-colors"
        />
        <button
          onClick={handleScan}
          disabled={scanning || !directory.trim()}
          className="px-6 py-3 bg-ink text-cream rounded-xl text-sm font-medium disabled:opacity-30 hover:bg-ink/80 transition-colors"
        >
          {scanning ? "..." : "Scan"}
        </button>
      </div>
      {message && <p className="mt-4 text-sm text-stone">{message}</p>}
    </div>
  );
}
