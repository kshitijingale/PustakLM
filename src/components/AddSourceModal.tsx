"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Type, Globe, Video, Subtitles, ArrowLeft, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

const TYPES = [
  { key: "pdf", label: "PDF", icon: FileText, desc: "Upload a document" },
  { key: "text", label: "Text", icon: Type, desc: "Paste plain text" },
  { key: "url", label: "Web Link", icon: Globe, desc: "Article or page" },
  { key: "youtube", label: "YouTube", icon: Video, desc: "Video transcript" },
  { key: "vtt", label: "VTT", icon: Subtitles, desc: "Caption file" },
];

export default function AddSourceModal({
  workspaceId,
  onClose,
  onAdded,
}: {
  workspaceId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [type, setType] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!type) return;
    setBusy(true);
    setError("");
    try {
      let res: Response;
      if (type === "pdf" || type === "vtt") {
        if (!file) throw new Error("Choose a file first");
        const form = new FormData();
        form.append("type", type);
        form.append("workspaceId", workspaceId);
        form.append("file", file);
        res = await fetch("/api/sources", { method: "POST", body: form });
      } else {
        res = await fetch("/api/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, workspaceId, text, url }),
        });
      }
      if (!res.ok) throw new Error((await res.json()).error || "Failed to add source");
      onAdded();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const selectedType = TYPES.find((t) => t.key === type);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent contentClassName="max-w-md p-0">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>{type ? selectedType?.label : "Add Source"}</DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {!type ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.15 }}
                className="mt-4 grid grid-cols-2 gap-3"
              >
                {TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setType(t.key)}
                    className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-surface-elevated p-4 text-left transition-all duration-200 hover:border-accent/30 hover:bg-surface-highlight active:scale-[0.98]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent transition-transform duration-200 group-hover:scale-110">
                      <t.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-fg">{t.label}</p>
                      <p className="text-xs text-fg-tertiary">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.15 }}
                className="mt-4 space-y-4"
              >
                {type === "text" && (
                  <Textarea
                    autoFocus
                    rows={8}
                    placeholder="Paste or write your text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                )}
                {(type === "url" || type === "youtube") && (
                  <Input
                    autoFocus
                    placeholder={type === "youtube" ? "https://youtube.com/watch?v=..." : "https://example.com/article"}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                )}
                {(type === "pdf" || type === "vtt") && (
                  <Input
                    type="file"
                    accept={type === "pdf" ? "application/pdf" : "text/vtt"}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                )}

                {error && <p className="text-sm text-error">{error}</p>}

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setType(null)} disabled={busy}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button disabled={busy} onClick={submit}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Source"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
