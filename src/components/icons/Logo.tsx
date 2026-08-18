"use client";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="forgeGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF9D5C" />
          <stop offset="100%" stopColor="#E87B35" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#forgeGradient)" />
      {/* Anvil / open book base */}
      <path
        d="M6 22c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v1H6v-1Z"
        className="fill-white/90"
      />
      <path
        d="M9 21v-4c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v4"
        className="stroke-white/70"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Ember / spark rising */}
      <path
        d="M16 9c-.5 1.5-2.5 4-2.5 6.5a2.5 2.5 0 0 0 5 0C18.5 13 16.5 10.5 16 9Z"
        className="fill-white"
      />
      <circle cx="16" cy="15.5" r="1.2" className="fill-accent" />
    </svg>
  );
}
