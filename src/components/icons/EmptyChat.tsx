"use client";

import { cn } from "@/lib/utils";

export function EmptyChat({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-40 h-30", className)}
      aria-hidden="true"
    >
      <rect x="16" y="24" width="96" height="56" rx="14" className="fill-surface-elevated" />
      <rect x="30" y="42" width="68" height="5" rx="2.5" className="fill-fg-tertiary/25" />
      <rect x="30" y="54" width="52" height="5" rx="2.5" className="fill-fg-tertiary/18" />
      <rect x="40" y="92" width="80" height="14" rx="7" className="fill-accent/20" />
      <circle cx="124" cy="44" r="16" className="fill-accent/15" />
      <path
        d="M116 44L122 50L134 38"
        stroke="#E87B35"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
