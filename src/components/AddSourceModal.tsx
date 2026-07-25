"use client";

import { useState } from "react";

const TYPES = [
  { key: "pdf", label: "PDF", icon: "📄" },
  { key: "text", label: "Text", icon: "📝" },
  { key: "url", label: "Web Link", icon: "🌐" },
  { key: "youtube", label: "YT Link", icon: "▶️" },
  { key: "vtt", label: "VTT", icon: "🗒️" },
];

export default function AddSourceModal({
  notebookId,
  onClose,
  onAdded,
}: {
  notebookId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [type, setType] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!type) return;
    setBusy(true);
    setError("");
    try {
      let res: Response;
      if (type === "pdf" || type === "vtt") {
        if (!file) throw new Error("Choose a file first");
        const form = new FormData();
        form.append("type", type);
        form.append("notebookId", notebookId);
        form.append("file", file);
        res = await fetch("/api/sources", { method: "POST", body: form });
      } else {
        res = await fetch("/api/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, notebookId, text, url }),
        });
      }
      if (!res.ok) throw new Error((await res.json()).error || "Failed to add source");
      onAdded();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card relative w-full max-w-lg p-6 animate-fadeUp">
        <h2 className="mb-4 text-lg font-medium">Add Source</h2>

        {!type ? (
          <div className="grid grid-cols-3 gap-3">
            {TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className="flex flex-col items-center gap-2 rounded-xl border border-white/10 py-6 hover:bg-white/5"
              >
                <span className="text-2xl">{t.icon}</span>
                <span className="text-sm">{t.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {type === "text" && (
              <textarea
                autoFocus
                rows={8}
                placeholder="Paste or write your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-transparent p-3 text-sm outline-none focus:border-saffron-500/50"
              />
            )}
            {(type === "url" || type === "youtube") && (
              <input
                autoFocus
                placeholder={type === "youtube" ? "https://youtube.com/watch?v=..." : "https://example.com/article"}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-transparent p-3 text-sm outline-none focus:border-saffron-500/50"
              />
            )}
            {(type === "pdf" || type === "vtt") && (
              <input
                type="file"
                accept={type === "pdf" ? "application/pdf" : "text/vtt"}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex justify-between pt-2">
              <button className="btn-ghost" onClick={() => setType(null)}>
                Back
              </button>
              <button className="btn-primary" disabled={busy} onClick={submit}>
                {busy ? "Adding…" : "Add Source"}
              </button>
            </div>
          </div>
        )}

        <button onClick={onClose} className="absolute right-4 top-4 text-parchment-100/50 hover:text-parchment-50">
          ✕
        </button>
      </div>
    </div>
  );
}
