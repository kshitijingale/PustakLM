"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Source } from "./SourceCard";

function sameSources(a: Source[], b: Source[]) {
  // Sources are small plain-JSON objects; a stringify compare is the simplest
  // reliable deep-equality check here.
  return JSON.stringify(a) === JSON.stringify(b);
}

// Owns the source list for a workspace: initial load, manual refresh, and the
// 3s polling that keeps status dots live while anything is uploading/indexing.
//
// Two guarantees that keep the rest of the page (especially the chat) stable:
//  1. State is only replaced when the server payload actually changed, so a
//     no-op poll tick causes zero re-renders anywhere in the tree.
//  2. The interval inspects a ref mirror of the latest sources instead of
//     running a side effect inside a setState updater (which StrictMode
//     double-invokes, causing duplicate fetches in dev).
export function useSources(workspaceId: string) {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const sourcesRef = useRef<Source[]>([]);

  useEffect(() => {
    sourcesRef.current = sources;
  }, [sources]);

  const loadSources = useCallback(async () => {
    try {
      const res = await fetch(`/api/sources?workspaceId=${workspaceId}`);
      if (res.ok) {
        const data = await res.json();
        const next: Source[] = Array.isArray(data.sources) ? data.sources : [];
        setSources((prev) => (sameSources(prev, next) ? prev : next));
      }
    } catch {
      // Keep current state on transient failures; the next poll retries.
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadSources();
    // Poll only while any source is still uploading/indexing.
    const interval = setInterval(() => {
      if (sourcesRef.current.some((s) => s.status === "uploading" || s.status === "indexing")) {
        loadSources();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [loadSources]);

  return { sources, loading, refresh: loadSources };
}
