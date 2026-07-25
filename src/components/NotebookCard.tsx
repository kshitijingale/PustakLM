"use client";

import Link from "next/link";
import { useState } from "react";

export default function NotebookCard({
  notebook,
  onDelete,
  onRename,
}: {
  notebook: { id: string; title: string; createdAt: string };
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="card group relative p-5 transition-transform hover:-translate-y-0.5">
      <Link href={`/notebook/${notebook.id}`} className="block">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
          📖
        </div>
        <h3 className="truncate font-medium">{notebook.title}</h3>
        <p className="mt-1 text-xs text-parchment-100/50">
          {new Date(notebook.createdAt).toLocaleDateString()}
        </p>
      </Link>

      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="absolute right-3 top-3 rounded-lg px-2 py-1 text-parchment-100/50 opacity-0 hover:bg-white/5 group-hover:opacity-100"
      >
        ⋯
      </button>

      {menuOpen && (
        <div className="absolute right-3 top-10 z-10 w-32 rounded-xl border border-white/10 bg-ink-800 p-1 shadow-soft">
          <button
            className="block w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-white/5"
            onClick={() => {
              const title = prompt("Rename notebook", notebook.title);
              if (title) onRename(notebook.id, title);
              setMenuOpen(false);
            }}
          >
            Rename
          </button>
          <button
            className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-red-400 hover:bg-white/5"
            onClick={() => {
              if (confirm(`Delete "${notebook.title}"? This cannot be undone.`)) onDelete(notebook.id);
              setMenuOpen(false);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
