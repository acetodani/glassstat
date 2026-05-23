import FolderScan from "./FolderScan";
import DragDropUpload from "./DragDropUpload";

export default function IngestPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Import Photos</h2>
        <p className="text-gray-400">
          Scan a local directory or upload files to analyze your gear usage.
        </p>
      </div>
      <FolderScan />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-800" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-950 px-4 text-sm text-gray-500">or</span>
        </div>
      </div>
      <DragDropUpload />
    </div>
  );
}
