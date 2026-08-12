"use client";

import { motion } from "framer-motion";
import { X, Loader2, RefreshCw, Trash2, FileText, Type, Globe, Video, Subtitles, Paperclip, CheckCircle2, AlertCircle } from "lucide-react";
import type { Source } from "./SourceCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5" />,
  text: <Type className="h-5 w-5" />,
  url: <Globe className="h-5 w-5" />,
  youtube: <Video className="h-5 w-5" />,
  vtt: <Subtitles className="h-5 w-5" />,
};

export default function SourceDetailPanel({
  source,
  onClose,
  onDelete,
  onReindex,
}: {
  source: Source;
  onClose: () => void;
  onDelete?: () => void;
  onReindex?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex h-full w-full flex-col bg-surface"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
            {TYPE_ICON[source.type] || <Paperclip className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-serif text-base font-semibold tracking-tight text-fg">
              {source.title}
            </h3>
            <p className="text-xs font-medium uppercase tracking-wider text-fg-tertiary">
              {source.type}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="rounded-2xl border border-border bg-surface-elevated p-4">
          <div className="mb-3 flex items-center gap-2">
            {source.status === "ready" ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </motion.div>
                <span className="text-xs font-medium text-success">Ready</span>
              </>
            ) : source.status === "failed" ? (
              <>
                <AlertCircle className="h-4 w-4 text-error" />
                <span className="text-xs font-medium text-error">Failed</span>
              </>
            ) : (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span className="text-xs font-medium text-accent">Indexing</span>
              </>
            )}
          </div>
          <p className="text-sm leading-relaxed text-fg-secondary break-words">
            {source.status === "ready"
              ? `Indexed into ${source.chunkCount} chunk(s) and ready for querying.`
              : source.status === "failed"
              ? source.errorMessage || "Indexing failed. Try re-indexing."
              : "Extracting and indexing this source..."}
          </p>
        </div>

        {(onDelete || onReindex) && (
          <div className="space-y-2">
            {source.status === "failed" && onReindex && (
              <Button variant="secondary" className="w-full" onClick={onReindex}>
                <RefreshCw className="h-4 w-4" />
                Re-index
              </Button>
            )}
            {onDelete && (
              <Button variant="danger" className="w-full" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
                Remove source
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
