"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Loader2, FileText, X, ChevronLeft, ChevronRight } from "lucide-react";
import SourceCard, { type Source } from "./SourceCard";
import AddSourceModal from "./AddSourceModal";
import EmptyState from "./EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function Sidebar({
  notebookId,
  sources,
  activeSourceId,
  onSelectSource,
  onRefresh,
  collapsed = false,
  onToggleCollapse,
  onClose,
}: {
  notebookId: string;
  sources: Source[];
  activeSourceId: string | null;
  onSelectSource: (id: string | null) => void;
  onRefresh: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);

  async function remove(id: string) {
    await fetch(`/api/sources/${id}`, { method: "DELETE" });
    if (activeSourceId === id) onSelectSource(null);
    onRefresh();
  }

  async function reindex(id: string) {
    await fetch(`/api/sources/${id}`, { method: "POST" });
    onRefresh();
  }

  const isIndexing = sources.some((s) => s.status === "uploading" || s.status === "indexing");

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-surface transition-all duration-300",
        collapsed ? "w-16" : "w-80"
      )}
    >
      <div className="flex items-center justify-between border-b border-border p-3">
        {!collapsed && (
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-xl border border-border bg-surface-elevated/60 px-3 py-1.5 text-sm font-medium text-fg-secondary transition-all duration-200 hover:border-accent/40 hover:bg-accent/10 hover:text-accent hover:shadow-glow"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            All notebooks
          </Link>

        )}
        <div className="flex items-center gap-1">
          {isIndexing && !collapsed && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
              <X className="h-4 w-4" />
            </Button>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="hidden md:inline-flex"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="border-b border-border p-3">
            <Button onClick={() => setShowAdd(true)} className="w-full">
              <Plus className="h-4 w-4" />
              Add Source
            </Button>
          </div>

          <div className="flex items-center justify-between px-3 pt-3">
            <span className="text-xs font-medium uppercase tracking-wider text-fg-tertiary">
              Sources
            </span>
            <Badge variant="accent" className="text-[10px]">
              {sources.length}
            </Badge>
          </div>
        </>
      )}

      <div className={cn("flex-1 space-y-1 overflow-y-auto p-3", collapsed && "p-2")}>
        {collapsed ? (
          sources.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSource(s.id)}
              className={cn(
                "flex w-full items-center justify-center rounded-xl p-2 transition-colors",
                activeSourceId === s.id ? "bg-accent/15 text-accent" : "text-fg-secondary hover:bg-surface-elevated hover:text-fg"
              )}
              title={s.title}
            >
              <span className="relative flex h-7 w-7 items-center justify-center">
                <FileText className="h-4 w-4" />
                <span className={cn("absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full",
                  s.status === "ready" ? "bg-success" : s.status === "failed" ? "bg-error" : "bg-warning animate-pulse"
                )} />
              </span>
            </button>
          ))
        ) : sources.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-7 w-7" />}
            title="No sources yet"
            description="Add a PDF, link, or transcript to start building your notebook."
            className="py-8"
          />
        ) : (
          sources.map((s) => (
            <SourceCard
              key={s.id}
              source={s}
              active={activeSourceId === s.id}
              onSelect={() => onSelectSource(s.id)}
              onDelete={() => remove(s.id)}
              onReindex={() => reindex(s.id)}
            />
          ))
        )}
      </div>

      {showAdd && (
        <AddSourceModal notebookId={notebookId} onClose={() => setShowAdd(false)} onAdded={onRefresh} />
      )}
    </aside>
  );
}
