"use client";

export type Citation = {
  index: number;
  sourceId: string;
  sourceTitle: string;
  sourceType: string;
  chunkText: string;
  page?: number | null;
  timestamp?: number | null;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CitationBadge({ citation, onOpen }: { citation: Citation; onOpen: () => void }) {
  const locator = citation.page ? `p. ${citation.page}` : citation.timestamp != null ? formatTime(citation.timestamp) : null;

  return (
    <button
      onClick={onOpen}
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs
        text-parchment-100/80 transition-colors hover:border-saffron-500/50 hover:text-saffron-400"
    >
      [{citation.index}] {citation.sourceTitle} {locator && <span className="text-parchment-100/40">· {locator}</span>}
    </button>
  );
}
