import { useState } from "react";
import { api } from "../../api/client";
import { FolderOpen, Loader2 } from "lucide-react";

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
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <FolderOpen className="w-5 h-5 text-glass-400" />
        <h3 className="font-medium">Scan Directory</h3>
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          value={directory}
          onChange={(e) => setDirectory(e.target.value)}
          placeholder="/path/to/your/photos"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-glass-500"
        />
        <button
          onClick={handleScan}
          disabled={scanning || !directory.trim()}
          className="px-4 py-2 bg-glass-600 hover:bg-glass-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
        >
          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Scan"}
        </button>
      </div>
      {message && <p className="mt-3 text-sm text-gray-400">{message}</p>}
    </div>
  );
}
