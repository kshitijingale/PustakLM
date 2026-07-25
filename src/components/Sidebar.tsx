"use client";

import { useState } from "react";
import Link from "next/link";
import SourceCard, { type Source } from "./SourceCard";
import AddSourceModal from "./AddSourceModal";

export default function Sidebar({
  notebookId,
  sources,
  activeSourceId,
  onSelectSource,
  onRefresh,
}: {
  notebookId: string;
  sources: Source[];
  activeSourceId: string | null;
  onSelectSource: (id: string | null) => void;
  onRefresh: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);

  async function remove(id: string) {
    await fetch(`/api/sources/${id}`, { method: "DELETE" });
    if (activeSourceId === id) onSelectSource(null);
    onRefresh();
  }

  async function reindex(id: string) {
    await fetch(`/api/sources/${id}`, { method: "POST" });
    onRefresh();
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-white/10 p-4">
      <Link href="/" className="mb-6 flex items-center gap-2 text-sm text-parchment-100/60 hover:text-parchment-50">
        ← All notebooks
      </Link>

      <button
        onClick={() => setShowAdd(true)}
        className="btn-primary mb-4 w-full justify-center"
      >
        + Add Source
      </button>

      <div className="mb-2 flex items-center gap-3 px-1 text-xs text-parchment-100/40">
        <span className="flex items-center gap-1"><span className="dot-indexing" /> Indexing</span>
        <span className="flex items-center gap-1"><span className="dot-ready" /> Indexed</span>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {sources.length === 0 && (
          <p className="px-1 py-6 text-center text-sm text-parchment-100/40">No sources yet.</p>
        )}
        {sources.map((s) => (
          <SourceCard
            key={s.id}
            source={s}
            active={activeSourceId === s.id}
            onSelect={() => onSelectSource(s.id)}
            onDelete={() => remove(s.id)}
            onReindex={() => reindex(s.id)}
          />
        ))}
      </div>

      {showAdd && (
        <AddSourceModal notebookId={notebookId} onClose={() => setShowAdd(false)} onAdded={onRefresh} />
      )}
    </aside>
  );
}
