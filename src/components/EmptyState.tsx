"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 text-center",
        className
      )}
    >
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-5 rounded-full bg-accent/10 blur-2xl"
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface-elevated text-accent shadow-soft">
          {icon}
        </div>
      </div>
      <div className="space-y-1.5">
        <h3 className="font-serif text-lg font-semibold tracking-tight text-fg">
          {title}
        </h3>
        <p className="mx-auto max-w-xs text-sm leading-relaxed text-fg-secondary">
          {description}
        </p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </motion.div>
  );
}
