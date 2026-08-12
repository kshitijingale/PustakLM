"use client";

import { useState, useEffect } from "react";
import { Loader2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RenameNotebookDialog({
  notebookId,
  open,
  onOpenChange,
  currentTitle,
  onRenamed,
}: {
  notebookId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  onRenamed: (title: string) => void;
}) {
  const [title, setTitle] = useState(currentTitle);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle, open]);

  async function rename() {
    if (!title.trim() || busy) return;
    setBusy(true);
    const res = await fetch(`/api/notebooks/${notebookId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    setBusy(false);
    if (res.ok) {
      onRenamed(title.trim());
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent contentClassName="max-w-md">
        <DialogHeader>
          <DialogTitle>Rename notebook</DialogTitle>
          <DialogDescription>
            Change the name of your notebook.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            autoFocus
            placeholder="Notebook title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && rename()}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={rename} disabled={!title.trim() || busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
