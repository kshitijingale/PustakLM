"use client";

import { useEffect, useRef, useState } from "react";
import CitationBadge, { type Citation } from "./CitationBadge";
import SourceViewer from "./SourceViewer";
import EmptyState from "./EmptyState";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
  streaming?: boolean;
  createdAt?: string;
};

export default function ChatPanel({ notebookId, hasSources }: { notebookId: string; hasSources: boolean }) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [openCitation, setOpenCitation] = useState<Citation | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    try {
      setHistoryLoading(true);
      const res = await fetch(`/api/chat?notebookId=${notebookId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        const sorted = [...data.messages]
          .map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            citations: m.citations || [],
            createdAt: m.createdAt,
          }))
          .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        setMsgs(sorted);
      }
    } catch {
      // Ignore load failures and keep the current UI state.
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, [notebookId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function ask() {
    const question = input.trim();
    if (!question || loading) return;
    setInput("");
    setLoading(true);

    setMsgs((m) => [
      ...m,
      { id: `u-${Date.now()}`, role: "user", content: question, citations: [] },
      { id: `a-${Date.now()}`, role: "assistant", content: "", citations: [], streaming: true },
    ]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notebookId, question }),
    });

    if (!res.ok || !res.body) {
      setMsgs((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { ...copy[copy.length - 1], content: "Something went wrong. Please try again.", streaming: false };
        return copy;
      });
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const evt of events) {
        const line = evt.replace(/^data: /, "").trim();
        if (!line || line === "[DONE]") continue;
        const data = JSON.parse(line);

        setMsgs((m) => {
          const copy = [...m];
          const last = { ...copy[copy.length - 1] };
          if (data.citations) last.citations = data.citations;
          if (data.token) last.content += data.token;
          copy[copy.length - 1] = last;
          return copy;
        });
      }
    }

    setMsgs((m) => {
      const copy = [...m];
      copy[copy.length - 1] = { ...copy[copy.length - 1], streaming: false };
      return copy;
    });
    await loadMessages();
    setLoading(false);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {historyLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-saffron-400/40 border-t-saffron-400" />
              <div>
                <p className="text-sm font-medium text-parchment-100">Loading conversation…</p>
                <p className="text-xs text-parchment-100/50">Fetching your chat history</p>
              </div>
            </div>
          </div>
        ) : msgs.length === 0 ? (
          <EmptyState
            icon="💬"
            title={hasSources ? "Ask anything about your sources" : "Add a source to get started"}
            description={
              hasSources
                ? "Every answer will be grounded in your notebook's sources, with citations you can inspect."
                : "PustakLM only answers from what you upload - no source, no answer."
            }
          />
        ) : (
          <div className="space-y-6">
            {msgs.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
                <div className={m.role === "user" ? "max-w-lg rounded-2xl bg-indigo-500/20 px-4 py-2 text-sm" : "max-w-2xl"}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {m.content}
                    {m.streaming && <span className="ml-0.5 inline-block h-4 w-1.5 animate-blink bg-saffron-400 align-middle" />}
                  </p>
                  {m.citations?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.citations.map((c) => (
                        <CitationBadge key={c.index} citation={c} onOpen={() => setOpenCitation(c)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="Type a Query here....."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-parchment-100/40"
          />
          <button onClick={ask} disabled={loading} className="btn-primary py-1.5">
            {loading ? "…" : "Ask"}
          </button>
        </div>
      </div>

      {openCitation && <SourceViewer citation={openCitation} onClose={() => setOpenCitation(null)} />}
    </div>
  );
}
