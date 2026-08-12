"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeft, PanelRight, Pencil, Trash2, MoreVertical } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import SourceDetailPanel from "@/components/SourceDetailPanel";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import RenameNotebookDialog from "@/components/RenameNotebookDialog";
import DeleteNotebookDialog from "@/components/DeleteNotebookDialog";
import { useSources } from "@/components/useSources";
import { Logo } from "@/components/icons/Logo";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

export default function NotebookPage({ params }: { params: { id: string } }) {
  const { sources, loading, refresh } = useSources(params.id);
  const [notebookTitle, setNotebookTitle] = useState("Notebook");
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [sourcePanelOpen, setSourcePanelOpen] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const activeSource = sources.find((s) => s.id === activeSourceId) || null;
  const hasReadySources = sources.some((s) => s.status === "ready");

  useEffect(() => {
    async function loadNotebook() {
      const res = await fetch("/api/notebooks");
      if (res.ok) {
        const { notebooks } = await res.json();
        const current = notebooks.find((n: any) => n.id === params.id);
        if (current) setNotebookTitle(current.title);
      }
    }
    loadNotebook();
  }, [params.id]);

  async function removeSource(id: string) {
    await fetch(`/api/sources/${id}`, { method: "DELETE" });
    if (activeSourceId === id) setActiveSourceId(null);
    refresh();
  }

  async function reindexSource(id: string) {
    await fetch(`/api/sources/${id}`, { method: "POST" });
    refresh();
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-5 text-center shadow-soft"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
          <div>
            <p className="text-sm font-medium text-fg">Loading notebook...</p>
            <p className="text-xs text-fg-tertiary">Fetching sources and conversation history</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-bg">
      <header className="glass flex items-center justify-between px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden shrink-0"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Logo className="hidden h-7 w-7 shrink-0 sm:block" />
          <div className="min-w-0">
            <h1 className="truncate font-serif text-base font-semibold tracking-tight text-fg">
              {notebookTitle}
            </h1>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={() => setShowRename(true)}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem destructive onClick={() => setShowDelete(true)}>
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {activeSource && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSourcePanelOpen((v) => !v)}
              className="hidden lg:inline-flex"
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          )}
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar
            notebookId={params.id}
            sources={sources}
            activeSourceId={activeSourceId}
            onSelectSource={(id) => {
              setActiveSourceId(id);
              setSourcePanelOpen(true);
            }}
            onRefresh={refresh}
            collapsed={desktopSidebarCollapsed}
            onToggleCollapse={() => setDesktopSidebarCollapsed((v) => !v)}
          />
        </div>

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] md:hidden"
              >
                <Sidebar
                  notebookId={params.id}
                  sources={sources}
                  activeSourceId={activeSourceId}
                  onSelectSource={(id) => {
                    setActiveSourceId(id);
                    setMobileSidebarOpen(false);
                  }}
                  onRefresh={refresh}
                  onClose={() => setMobileSidebarOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Source detail panel — desktop */}
        <AnimatePresence>
          {activeSource && sourcePanelOpen && (
            <div className="hidden lg:block w-80 shrink-0 border-r border-border">
              <SourceDetailPanel
                source={activeSource}
                onClose={() => setSourcePanelOpen(false)}
                onDelete={() => removeSource(activeSource.id)}
                onReindex={() => reindexSource(activeSource.id)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Source detail panel — mobile bottom sheet */}
        <AnimatePresence>
          {activeSource && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveSourceId(null)}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] rounded-t-3xl border-t border-border bg-surface shadow-soft lg:hidden"
              >
                <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-border" />
                <SourceDetailPanel
                  source={activeSource}
                  onClose={() => setActiveSourceId(null)}
                  onDelete={() => removeSource(activeSource.id)}
                  onReindex={() => reindexSource(activeSource.id)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Chat */}
        <div className="flex-1 min-w-0">
          <ChatPanel notebookId={params.id} hasSources={hasReadySources} />
        </div>
      </div>

      <RenameNotebookDialog
        notebookId={params.id}
        open={showRename}
        onOpenChange={setShowRename}
        currentTitle={notebookTitle}
        onRenamed={setNotebookTitle}
      />
      <DeleteNotebookDialog
        notebookId={params.id}
        title={notebookTitle}
        open={showDelete}
        onOpenChange={setShowDelete}
        onDeleted={() => {
          window.location.href = "/";
        }}
      />
    </div>
  );
}
