"use client";

import { cn } from "@/lib/utils";

export function EmptyWorkspaces({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-40 h-30", className)}
      aria-hidden="true"
    >
      <rect x="24" y="16" width="112" height="88" rx="12" className="fill-surface-elevated" />
      <rect x="36" y="32" width="64" height="6" rx="3" className="fill-fg-tertiary/30" />
      <rect x="36" y="48" width="88" height="4" rx="2" className="fill-fg-tertiary/20" />
      <rect x="36" y="58" width="72" height="4" rx="2" className="fill-fg-tertiary/20" />
      <rect x="36" y="68" width="80" height="4" rx="2" className="fill-fg-tertiary/20" />
      <circle cx="118" cy="84" r="18" className="fill-accent/20" />
      <path d="M110 84H126M118 76V92" stroke="#E87B35" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
