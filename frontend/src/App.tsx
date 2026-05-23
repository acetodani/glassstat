import { Routes, Route } from "react-router-dom";
import Nav from "./components/layout/Nav";
import Dashboard from "./components/Dashboard";
import IngestPage from "./components/ingestion/IngestPage";
import WrappedPage from "./components/wrapped/WrappedPage";

export default function App() {
  return (
    <div className="min-h-screen bg-cream">
      <Nav />
      <main className="max-w-6xl mx-auto px-6 pb-24">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ingest" element={<IngestPage />} />
          <Route path="/wrapped" element={<WrappedPage />} />
        </Routes>
      </main>
    </div>
  );
}
