import FolderScan from "./FolderScan";
import DragDropUpload from "./DragDropUpload";

export default function IngestPage() {
  return (
    <div className="max-w-xl mx-auto pt-12 space-y-12">
      <div>
        <h1 className="font-display text-5xl">Import</h1>
        <p className="text-stone mt-3">
          Point at your photo folder, or drop some files.
        </p>
      </div>
      <FolderScan />
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-sand" />
        <span className="text-stone text-xs font-mono">or</span>
        <div className="flex-1 h-px bg-sand" />
      </div>
      <DragDropUpload />
    </div>
  );
}
