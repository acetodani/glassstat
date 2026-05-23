import { Routes, Route } from "react-router-dom";
import Nav from "./components/layout/Nav";
import Dashboard from "./components/Dashboard";
import IngestPage from "./components/ingestion/IngestPage";
import WrappedPage from "./components/wrapped/WrappedPage";
import GalleryPage from "./components/gallery/GalleryPage";

export default function App() {
  return (
    <div className="min-h-screen bg-cream">
      <Nav />
      <main className="max-w-6xl mx-auto px-6 pb-24">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/wrapped" element={<WrappedPage />} />
          <Route path="/ingest" element={<IngestPage />} />
        </Routes>
      </main>
    </div>
  );
}
