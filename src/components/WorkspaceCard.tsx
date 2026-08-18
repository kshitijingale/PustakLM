"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import RenameWorkspaceDialog from "@/components/RenameWorkspaceDialog";
import DeleteWorkspaceDialog from "@/components/DeleteWorkspaceDialog";
import { cn } from "@/lib/utils";

export default function WorkspaceCard({
  workspace,
  onDelete,
  onRename,
}: {
  workspace: { id: string; title: string; createdAt: string };
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}) {
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="group card relative overflow-hidden p-5 transition-shadow duration-300 hover:shadow-glow"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/5 blur-2xl transition-opacity group-hover:opacity-100" />
      <Link href={`/workspace/${workspace.id}`} className="relative block">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-glow">
          <Layers className="h-6 w-6" />
        </div>
        <h3 className="truncate font-serif text-lg font-semibold tracking-tight text-fg">
          {workspace.title}
        </h3>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-fg-tertiary">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(workspace.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      </Link>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            className="absolute right-3 top-3 rounded-lg p-1.5 text-fg-tertiary transition-all hover:bg-surface-elevated hover:text-fg focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
            onClick={(e) => e.preventDefault()}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
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

      <RenameWorkspaceDialog
        workspaceId={workspace.id}
        open={showRename}
        onOpenChange={setShowRename}
        currentTitle={workspace.title}
        onRenamed={(title) => onRename(workspace.id, title)}
      />
      <DeleteWorkspaceDialog
        workspaceId={workspace.id}
        title={workspace.title}
        open={showDelete}
        onOpenChange={setShowDelete}
        onDeleted={() => onDelete(workspace.id)}
      />
    </motion.div>
  );
}
