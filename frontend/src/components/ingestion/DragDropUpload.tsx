import { useState, useCallback } from "react";
import { api } from "../../api/client";

export default function DragDropUpload({ onUploadStart }: { onUploadStart: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    await uploadFiles(files);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(files);
  };

  const uploadFiles = async (files: FileList) => {
    setError("");
    try {
      await api.uploadFiles(files);
      onUploadStart();
    } catch {
      setError("Upload failed");
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
        dragging ? "border-accent bg-accent/5 scale-[1.02]" : "border-sand hover:border-stone"
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
          JPEG, RAW, HEIF — anything with EXIF
        </p>
      </label>
      {error && <p className="mt-4 text-sm text-accent">{error}</p>}
    </div>
  );
}
