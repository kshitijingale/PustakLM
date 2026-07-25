"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import ThemeToggle from "@/components/ThemeToggle";
import type { Source } from "@/components/SourceCard";

export default function NotebookPage({ params }: { params: { id: string } }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);

  const loadSources = useCallback(async () => {
    const res = await fetch(`/api/sources?notebookId=${params.id}`);
    if (res.ok) setSources((await res.json()).sources);
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

  return (
    <div className="flex h-screen flex-col">
      <header className="glass flex items-center justify-between px-6 py-3">
        <h1 className="text-sm font-medium text-parchment-100/70">📖💬 PustakLM</h1>
        <ThemeToggle />
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
