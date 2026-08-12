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
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-2.5 py-1 text-xs
        text-fg-secondary transition-all duration-200 hover:-translate-y-px hover:border-accent/40
        hover:bg-accent/10 hover:text-accent"
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/15 text-[10px] font-semibold text-accent">
        {citation.index}
      </span>
      <span className="max-w-[140px] truncate">{citation.sourceTitle}</span>
      {locator && <span className="text-fg-tertiary">· {locator}</span>}
    </button>
  );
}
