"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

export default function DeleteNotebookDialog({
  notebookId,
  title,
  open,
  onOpenChange,
  onDeleted,
}: {
  notebookId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (busy) return;
    setBusy(true);
    const res = await fetch(`/api/notebooks/${notebookId}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      onDeleted();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent contentClassName="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete notebook</DialogTitle>
          <DialogDescription>
            Delete &ldquo;{title}&rdquo;? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={remove} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
