"use client";

import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-xl bg-gradient-to-r from-surface-elevated via-surface-highlight to-surface-elevated bg-[length:200%_100%]",
        className
      )}
    />
  );
}
