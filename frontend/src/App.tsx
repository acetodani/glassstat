import { Routes, Route } from "react-router-dom";
import Nav from "./components/layout/Nav";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import IngestPage from "./components/ingestion/IngestPage";
import WrappedPage from "./components/wrapped/WrappedPage";
import GalleryPage from "./components/gallery/GalleryPage";

export default function App() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-6xl mx-auto px-6 pb-24 pt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/overview" element={<Dashboard />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/wrapped" element={<WrappedPage />} />
          <Route path="/ingest" element={<IngestPage />} />
        </Routes>
      </main>
    </div>
  );
}
