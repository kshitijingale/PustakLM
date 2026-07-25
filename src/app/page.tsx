"use client";

import { useEffect, useState } from "react";
import NotebookCard from "@/components/NotebookCard";
import EmptyState from "@/components/EmptyState";
import ThemeToggle from "@/components/ThemeToggle";

type Notebook = { id: string; title: string; createdAt: string };

export default function HomePage() {
  const [notebooks, setNotebooks] = useState<Notebook[] | null>(null);

  async function load() {
    const res = await fetch("/api/notebooks");
    if (res.ok) setNotebooks((await res.json()).notebooks);
  }

  useEffect(() => {
    load();
  }, []);

  async function createNotebook() {
    const res = await fetch("/api/notebooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled Notebook" }),
    });
    if (res.ok) {
      const { notebook } = await res.json();
      window.location.href = `/notebook/${notebook.id}`;
    }
  }

  async function deleteNotebook(id: string) {
    await fetch(`/api/notebooks/${id}`, { method: "DELETE" });
    load();
  }

  async function renameNotebook(id: string, title: string) {
    await fetch(`/api/notebooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    load();
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <header className="glass mb-10 flex items-center justify-between rounded-2xl px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">📖💬 PustakLM</h1>
          <p className="text-xs text-parchment-100/50">Your library. Now conversational.</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-medium">Your notebooks</h2>
        <button onClick={createNotebook} className="btn-primary">
          + New Notebook
        </button>
      </div>

      {notebooks === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-32 animate-pulse" />
          ))}
        </div>
      ) : notebooks.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No notebooks yet"
          description="Create your first notebook to start uploading sources and asking questions."
          action={
            <button onClick={createNotebook} className="btn-primary">
              + New Notebook
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notebooks.map((n) => (
            <NotebookCard key={n.id} notebook={n} onDelete={deleteNotebook} onRename={renameNotebook} />
          ))}
        </div>
      )}
    </main>
  );
}
