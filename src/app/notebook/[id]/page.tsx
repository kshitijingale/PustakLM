"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import ThemeToggle from "@/components/ThemeToggle";
import type { Source } from "@/components/SourceCard";
import LogoutButton from "@/components/LogoutButton";

export default function NotebookPage({ params }: { params: { id: string } }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSources = useCallback(async () => {
    try {
      const res = await fetch(`/api/sources?notebookId=${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setSources(Array.isArray(data.sources) ? data.sources : []);
      }
    } catch {
      setSources([]);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadSources();
    // Poll while any source is still uploading/indexing so status dots update live.
    const interval = setInterval(() => {
      setSources((current) => {
        if (current.some((s) => s.status === "uploading" || s.status === "indexing")) loadSources();
        return current;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [loadSources]);

  const activeSource = sources.find((s) => s.id === activeSourceId) || null;
  const hasReadySources = sources.some((s) => s.status === "ready");

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-saffron-400/40 border-t-saffron-400" />
          <div>
            <p className="text-sm font-medium text-parchment-100">Loading notebook…</p>
            <p className="text-xs text-parchment-100/50">Fetching sources and conversation history</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="glass flex items-center justify-between px-6 py-3">
        <h1 className="text-sm font-medium text-parchment-100/70">📖💬 PustakLM</h1>
        <ThemeToggle />
        <LogoutButton />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          notebookId={params.id}
          sources={sources}
          activeSourceId={activeSourceId}
          onSelectSource={setActiveSourceId}
          onRefresh={loadSources}
        />

        {/* Middle: selected source preview, or nothing if none selected */}
        {activeSource && (
          <div className="w-80 shrink-0 overflow-y-auto border-r border-white/10 p-5">
            <h3 className="mb-2 text-sm font-medium">{activeSource.title}</h3>
            <p className="text-xs uppercase tracking-wide text-parchment-100/40">{activeSource.type}</p>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-parchment-100/60">
              {activeSource.status === "ready"
                ? `Indexed into ${activeSource.chunkCount} chunk(s) and ready for querying.`
                : activeSource.status === "failed"
                ? activeSource.errorMessage || "Indexing failed - try re-indexing."
                : "Extracting and indexing this source…"}
            </div>
          </div>
        )}

        <div className="flex-1">
          <ChatPanel notebookId={params.id} hasSources={hasReadySources} />
        </div>
      </div>
    </div>
  );
}
