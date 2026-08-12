"use client";

import { motion } from "framer-motion";
import { X, ExternalLink, FileText } from "lucide-react";
import type { Citation } from "./CitationBadge";
import { Button } from "@/components/ui/Button";

export default function SourceViewer({ citation, onClose }: { citation: Citation; onClose: () => void }) {
  const youtubeLink =
    citation.sourceType === "youtube" && citation.timestamp != null
      ? `#t=${citation.timestamp}`
      : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border bg-surface shadow-soft"
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif font-semibold tracking-tight text-fg">Source</h3>
                <p className="text-xs text-fg-tertiary capitalize">{citation.sourceType}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-4 flex flex-wrap gap-2 text-xs font-medium uppercase tracking-wider text-fg-secondary">
            {citation.page != null && <span>Page {citation.page}</span>}
            {citation.timestamp != null && (
              <span>{Math.floor(citation.timestamp / 60)}:{(citation.timestamp % 60).toString().padStart(2, "0")}</span>
            )}
          </div>

          <h4 className="mb-4 font-serif text-lg font-semibold tracking-tight text-fg">
            {citation.sourceTitle}
          </h4>

          <div className="flex-1 overflow-y-auto">
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5 text-sm leading-relaxed text-fg-secondary">
              <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-accent">
                Cited passage
              </span>
              {citation.chunkText}
            </div>
          </div>

          {youtubeLink && (
            <Button variant="secondary" className="mt-4 w-full" asChild>
              <a href={youtubeLink} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Jump to timestamp
              </a>
            </Button>
          )}
        </div>
      </motion.div>
    </>
  );
}
