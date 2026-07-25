"use client";

import type { Citation } from "./CitationBadge";

// Selecting a citation opens this panel, "highlighting" the cited chunk and
// giving a link to jump into the original source (PDF page / YouTube
// timestamp / website / transcript position) as required by the spec.
export default function SourceViewer({ citation, onClose }: { citation: Citation; onClose: () => void }) {
  const youtubeLink =
    citation.sourceType === "youtube" && citation.timestamp != null
      ? `#t=${citation.timestamp}` // in a full build: youtube.com/watch?v=<id>&t=<timestamp>s
      : null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md animate-fadeUp border-l border-white/10 bg-ink-900 p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium">Source</h3>
        <button onClick={onClose} className="text-parchment-100/50 hover:text-parchment-50">
          ✕
        </button>
      </div>

      <div className="mb-3 flex items-center gap-2 text-sm text-parchment-100/60">
        <span className="uppercase tracking-wide">{citation.sourceType}</span>
        {citation.page != null && <span>· Page {citation.page}</span>}
        {citation.timestamp != null && <span>· {Math.floor(citation.timestamp / 60)}:{(citation.timestamp % 60).toString().padStart(2, "0")}</span>}
      </div>

      <h4 className="mb-3 font-medium">{citation.sourceTitle}</h4>

      {/* Highlighted cited chunk - the exact excerpt the answer was grounded in */}
      <div className="rounded-xl border border-saffron-500/30 bg-saffron-500/10 p-4 text-sm leading-relaxed">
        {citation.chunkText}
      </div>

      {youtubeLink && (
        <a href={youtubeLink} target="_blank" className="btn-ghost mt-4 inline-flex">
          ▶️ Jump to timestamp
        </a>
      )}
    </div>
  );
}
