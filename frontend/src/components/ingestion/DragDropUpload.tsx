import { useState, useCallback } from "react";

interface FileProgress {
  name: string;
  size: number;
  status: "pending" | "uploading" | "done" | "error";
}

export default function DragDropUpload({ onUploadStart }: { onUploadStart: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<FileProgress[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      startUpload(e.dataTransfer.files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startUpload(e.target.files);
    }
  };

  const ALLOWED_EXT = new Set([
    ".jpg", ".jpeg", ".png", ".tiff", ".tif", ".webp",
    ".cr2", ".cr3", ".nef", ".arw", ".orf", ".rw2",
    ".raf", ".dng", ".heif", ".heic", ".avif",
  ]);

  const startUpload = async (fileList: FileList) => {
    const fileArray = Array.from(fileList);
    const MAX_SIZE = 50 * 1024 * 1024;

    const validExt = fileArray.filter((f) => {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      return ALLOWED_EXT.has(ext);
    });
    const invalidExt = fileArray.filter((f) => {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      return !ALLOWED_EXT.has(ext);
    });

    const valid = validExt.filter((f) => f.size <= MAX_SIZE);
    const tooLarge = validExt.filter((f) => f.size > MAX_SIZE);

    const progress: FileProgress[] = [
      ...valid.map((f) => ({ name: f.name, size: f.size, status: "pending" as const })),
      ...tooLarge.map((f) => ({ name: f.name, size: f.size, status: "error" as const })),
      ...invalidExt.map((f) => ({ name: f.name, size: f.size, status: "error" as const })),
    ];
    setFiles(progress);
    setUploading(true);

    // Upload in batches of 5 for responsiveness
    const BATCH = 5;
    for (let i = 0; i < valid.length; i += BATCH) {
      const batch = valid.slice(i, i + BATCH);
      const form = new FormData();
      batch.forEach((f) => form.append("files", f));

      // Mark batch as uploading
      setFiles((prev) =>
        prev.map((p) =>
          batch.some((b) => b.name === p.name) ? { ...p, status: "uploading" } : p
        )
      );

      try {
        await fetch("/api/ingest/upload", { method: "POST", body: form });

        setFiles((prev) =>
          prev.map((p) =>
            batch.some((b) => b.name === p.name) ? { ...p, status: "done" } : p
          )
        );
      } catch {
        setFiles((prev) =>
          prev.map((p) =>
            batch.some((b) => b.name === p.name) ? { ...p, status: "error" } : p
          )
        );
      }
    }

    // All done — trigger scan progress view
    setTimeout(() => onUploadStart(), 300);
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  // Show upload progress state
  if (uploading && files.length > 0) {
    const doneCount = files.filter((f) => f.status === "done").length;
    const pct = files.length > 0 ? Math.round((doneCount / files.length) * 100) : 0;

    return (
      <div className="bg-warm rounded-3xl p-8 space-y-4 animate-fade-in">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-2xl">Uploading</p>
          <p className="font-mono text-xs text-stone">
            {doneCount}/{files.length} files · {formatSize(totalSize)}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-sand rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* File list */}
        <div className="max-h-48 overflow-y-auto space-y-1.5 pt-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <span className="font-mono text-xs truncate max-w-[70%]">{f.name}</span>
              <span className={`font-mono text-[10px] ${
                f.status === "done" ? "text-green-600" :
                f.status === "uploading" ? "text-accent" :
                f.status === "error" ? "text-red-500" : "text-sand"
              }`}>
                {f.status === "done" ? "done" :
                 f.status === "uploading" ? "sending..." :
                 f.status === "error" ? "skipped" :
                 formatSize(f.size)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
        dragging ? "border-accent bg-accent/5 scale-[1.01]" : "border-sand hover:border-stone"
      }`}
    >
      <input
        type="file"
        multiple
        accept="image/*,.cr2,.cr3,.nef,.arw,.orf,.rw2,.raf,.dng,.heic,.heif"
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <p className="font-display text-2xl">Drop files here</p>
        <p className="text-stone text-sm mt-2">
          JPEG, RAW, HEIF — up to 50MB each
        </p>
      </label>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
