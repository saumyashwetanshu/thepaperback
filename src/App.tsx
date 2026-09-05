import React, { useState, useEffect, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Home } from "./pages/Home";
import { StoryDossier } from "./pages/StoryDossier";
import { LiveWire } from "./pages/LiveWire";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { GlobalSkeleton } from "./components/GlobalSkeleton";
import { FactCheck } from "./pages/FactCheck";
import { VoicesOfIndia } from "./pages/VoicesOfIndia";
import { PulseAudio } from "./pages/PulseAudio";
import { Search } from "./pages/Search";
import { Protocol } from "./pages/Protocol";
import { SourceDirectory } from "./pages/SourceDirectory";

export type NavTabId = "stories" | "factcheck" | "voices" | "pulse" | "intelligence";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>("stories");
  const location = useLocation();

  useEffect(() => {
    const eventSource = new EventSource("/api/stream");
    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.timestamp) {
          window.dispatchEvent(new Event("news_updated"));
        }
      } catch (err) {}
    };
    return () => eventSource.close();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setActiveTab("stories");
    else if (path === "/fact-check") setActiveTab("factcheck");
    else if (path === "/voices") setActiveTab("voices");
    else if (path === "/pulse") setActiveTab("pulse");
  }, [location.pathname]);

  useEffect(() => {
    // Synchronize stored theme preference (default to light mode)
    const savedTheme = localStorage.getItem("paperback_theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="antialiased min-h-screen flex flex-col font-sans bg-white dark:bg-black text-black dark:text-white transition-colors duration-200 selection:bg-rose-600 selection:text-white">
      <Header />
      <main className="flex-grow w-full flex flex-col">
        <ErrorBoundary>
          <Suspense fallback={<GlobalSkeleton />}>
            <Routes>
              <Route path="/" element={<Home activeTab={activeTab} />} />
              <Route path="/live" element={<LiveWire />} />
              <Route path="/story/:id" element={<StoryDossier />} />
              <Route path="/fact-check" element={<FactCheck />} />
              <Route path="/voices" element={<VoicesOfIndia />} />
              <Route path="/pulse" element={<PulseAudio />} />
              <Route path="/search" element={<Search />} />
              <Route path="/protocol" element={<Protocol />} />
              <Route path="/source-directory" element={<SourceDirectory />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
