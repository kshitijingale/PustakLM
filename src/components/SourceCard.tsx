"use client";

import { FileText, Type, Globe, Video, Subtitles, Paperclip, RefreshCw, X, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  text: <Type className="h-4 w-4" />,
  url: <Globe className="h-4 w-4" />,
  youtube: <Video className="h-4 w-4" />,
  vtt: <Subtitles className="h-4 w-4" />,
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
  const isIndexing = source.status === "uploading" || source.status === "indexing";

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200 overflow-hidden",
        active
          ? "border-accent/40 bg-accent/10 shadow-glow"
          : "border-transparent hover:border-border hover:bg-surface-elevated hover:shadow-soft"
      )}
      title={source.status === "failed" ? source.errorMessage || "Indexing failed" : undefined}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
      )}

      {isIndexing && (
        <motion.div
          className="absolute inset-0 bg-accent/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <span
        className={cn(
          "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          active ? "bg-accent/20 text-accent" : "bg-surface-highlight text-fg-secondary"
        )}
      >
        {isIndexing ? (
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
        ) : source.status === "ready" ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <CheckCircle2 className="h-4 w-4 text-success" />
          </motion.div>
        ) : (
          TYPE_ICON[source.type] || <Paperclip className="h-4 w-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-fg">{source.title}</p>
        <p className="text-xs text-fg-tertiary capitalize">{source.type}</p>
      </div>

      {source.status === "ready" ? (
        <span className="relative shrink-0 h-2 w-2 rounded-full bg-success" />
      ) : source.status === "failed" ? (
        <span className="relative shrink-0 h-2 w-2 rounded-full bg-error" />
      ) : (
        <span className="relative shrink-0 h-2 w-2 rounded-full bg-warning animate-pulse" />
      )}

      <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex relative">
        {source.status === "failed" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReindex();
            }}
            className="rounded-md p-1 text-fg-tertiary transition-colors hover:bg-surface-highlight hover:text-fg"
            title="Re-index"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-md p-1 text-fg-tertiary transition-colors hover:bg-error/10 hover:text-error"
          title="Remove"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
