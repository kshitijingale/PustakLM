"use client";

const TYPE_ICON: Record<string, string> = {
  pdf: "📄",
  text: "📝",
  url: "🌐",
  youtube: "▶️",
  vtt: "🗒️",
};

export type Source = {
  id: string;
  type: string;
  title: string;
  status: "uploading" | "indexing" | "ready" | "failed";
  chunkCount: number | null;
  errorMessage?: string | null;
};

export default function SourceCard({
  source,
  active,
  onSelect,
  onDelete,
  onReindex,
}: {
  source: Source;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onReindex: () => void;
}) {
  const dotClass =
    source.status === "ready" ? "dot-ready" : source.status === "failed" ? "dot-failed" : "dot-indexing";

  return (
    <div
      onClick={onSelect}
      className={`group flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
        active ? "border-saffron-500/40 bg-saffron-500/10" : "border-transparent hover:bg-white/5"
      }`}
      title={source.status === "failed" ? source.errorMessage || "Indexing failed" : undefined}
    >
      <span>{TYPE_ICON[source.type] || "📎"}</span>
      <span className="flex-1 truncate">{source.title}</span>
      <span className={dotClass} />

      <div className="hidden gap-1 group-hover:flex">
        {source.status === "failed" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReindex();
            }}
            className="text-xs text-parchment-100/60 hover:text-parchment-50"
            title="Re-index"
          >
            ↻
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-xs text-parchment-100/60 hover:text-red-400"
          title="Remove"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
