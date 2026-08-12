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
      <rect width="32" height="32" rx="8" className="fill-accent" />
      <path
        d="M9 9.5C9 8.67157 9.67157 8 10.5 8H14.5C15.3284 8 16 8.67157 16 9.5V22.5C16 23.3284 15.3284 24 14.5 24H10.5C9.67157 24 9 23.3284 9 22.5V9.5Z"
        className="fill-white/90"
      />
      <path
        d="M17 9.5C17 8.67157 17.6716 8 18.5 8H22.5C23.3284 8 24 8.67157 24 9.5V22.5C24 23.3284 23.3284 24 22.5 24H18.5C17.6716 24 17 23.3284 17 22.5V9.5Z"
        className="fill-white/60"
      />
      <path
        d="M11 12H14M11 15.5H14M11 19H13.5"
        stroke="#161412"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M19 12H22M19 15.5H22M19 19H21.5"
        stroke="#161412"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
