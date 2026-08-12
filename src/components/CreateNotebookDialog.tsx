"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CreateNotebookDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!title.trim() || busy) return;
    setBusy(true);
    const res = await fetch("/api/notebooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    setBusy(false);
    if (res.ok) {
      const { notebook } = await res.json();
      onCreated(notebook.id);
      onOpenChange(false);
      setTitle("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent contentClassName="max-w-md">
        <DialogHeader>
          <DialogTitle>Create notebook</DialogTitle>
          <DialogDescription>
            Give your notebook a name to organize your sources and conversations.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            autoFocus
            placeholder="e.g. Research on AI safety"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={create} disabled={!title.trim() || busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
