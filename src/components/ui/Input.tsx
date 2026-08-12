"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-tertiary transition-all duration-200 hover:border-border/80 focus:border-accent/50 focus:ring-2 focus:ring-accent/15 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          type === "file" && "py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-surface-highlight file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-fg hover:file:bg-border",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
