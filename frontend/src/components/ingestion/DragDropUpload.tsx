import { useState, useCallback } from "react";
import { api } from "../../api/client";
import { Upload, Loader2 } from "lucide-react";

export default function DragDropUpload() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

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
    setUploading(true);
    setMessage("");
    try {
      const result = await api.uploadFiles(files);
      setMessage(result.message);
    } catch {
      setMessage("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`bg-gray-900 border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
        dragging ? "border-glass-400 bg-glass-600/10" : "border-gray-700 hover:border-gray-600"
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
        {uploading ? (
          <Loader2 className="w-10 h-10 mx-auto text-glass-400 animate-spin" />
        ) : (
          <Upload className="w-10 h-10 mx-auto text-gray-500" />
        )}
        <p className="mt-3 text-sm text-gray-400">
          Drag & drop photos here, or click to browse
        </p>
        <p className="mt-1 text-xs text-gray-600">
          Supports JPEG, RAW (CR2/CR3/NEF/ARW/DNG), HEIF, and more
        </p>
      </label>
      {message && <p className="mt-3 text-sm text-glass-300">{message}</p>}
    </div>
  );
}
