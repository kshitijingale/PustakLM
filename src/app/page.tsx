"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, X, FolderPlus, Upload, MessageCircle } from "lucide-react";
import WorkspaceCard from "@/components/WorkspaceCard";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import CreateWorkspaceDialog from "@/components/CreateWorkspaceDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyWorkspaces } from "@/components/icons/EmptyWorkspaces";
import { Logo } from "@/components/icons/Logo";

type Workspace = { id: string; title: string; createdAt: string };

const ONBOARDING_STEPS = [
  {
    icon: FolderPlus,
    title: "Create a workspace",
    description: "One for each goal — coding, exam prep, book reading, and more.",
  },
  {
    icon: Upload,
    title: "Add sources",
    description: "Upload PDFs, paste links, drop YouTube videos, or add text and transcripts.",
  },
  {
    icon: MessageCircle,
    title: "Ask & learn",
    description: "Get answers grounded in your sources, with smart citations.",
  },
];

export default function HomePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);
  const [filtered, setFiltered] = useState<Workspace[] | null>(null);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    const res = await fetch("/api/workspaces");
    if (res.ok) setWorkspaces((await res.json()).workspaces);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!workspaces) return setFiltered(null);
    const q = query.trim().toLowerCase();
    if (!q) return setFiltered(workspaces);
    setFiltered(workspaces.filter((w) => w.title.toLowerCase().includes(q)));
  }, [workspaces, query]);

  function deleteWorkspace(id: string) {
    setWorkspaces((prev) => prev?.filter((w) => w.id !== id) ?? prev);
  }

  function renameWorkspace(id: string, title: string) {
    setWorkspaces((prev) => prev?.map((w) => (w.id === id ? { ...w, title } : w)) ?? prev);
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="glass mb-8 flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 sm:h-9 sm:w-9" />
          <div>
            <h1 className="font-serif text-lg font-semibold tracking-tight text-fg sm:text-xl">
              LearnForge
            </h1>
            <p className="hidden text-xs text-fg-tertiary sm:block">
              Turn sources into understanding.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      <section className="mb-10 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface to-surface-elevated p-6 sm:p-8">
        <div className="mb-6 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Welcome to LearnForge
          </div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Forge knowledge from your sources
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
            Turn PDFs, articles, videos, and notes into a workspace you can chat with. Three simple steps to get started:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {ONBOARDING_STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group relative rounded-2xl border border-border bg-surface/60 p-4 transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:bg-surface-elevated hover:shadow-soft"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent transition-transform group-hover:scale-110">
                <step.icon className="h-5 w-5" />
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-semibold text-accent">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-fg">{step.title}</h3>
                  <p className="mt-0.5 text-xs leading-5 text-fg-secondary">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

	      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Your workspaces
          </h2>
          <p className="mt-1 text-sm text-fg-secondary">
            {workspaces === null
              ? "Loading your workspaces..."
              : `${filtered?.length ?? 0} of ${workspaces.length} workspace${workspaces.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-tertiary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workspaces..."
              className="w-full pl-9 pr-9 sm:w-64"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-fg-tertiary hover:bg-surface-elevated hover:text-fg"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button onClick={() => setShowCreate(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            New Workspace
          </Button>
        </div>
      </div>

      {workspaces === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card flex flex-col items-center justify-center gap-6 py-16 text-center"
        >
          <div className="relative">
            <div aria-hidden className="absolute -inset-8 rounded-full bg-accent/10 blur-3xl" />
            <EmptyWorkspaces className="relative h-32 w-40" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-semibold tracking-tight text-fg">
              No workspaces yet
            </h3>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-fg-secondary">
              Create your first workspace to start uploading sources and asking questions grounded in your own library.
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            New Workspace
          </Button>
        </motion.div>
      ) : filtered?.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-sm text-fg-secondary">No workspaces match &ldquo;{query}&rdquo;</p>
          <Button variant="ghost" onClick={() => setQuery("")}>
            Clear search
          </Button>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered?.map((w) => (
            <WorkspaceCard
              key={w.id}
              workspace={w}
              onDelete={deleteWorkspace}
              onRename={renameWorkspace}
            />
          ))}
        </motion.div>
      )}

      <CreateWorkspaceDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={(id) => (window.location.href = `/workspace/${id}`)}
      />
    </main>
  );
}
