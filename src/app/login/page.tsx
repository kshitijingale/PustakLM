"use client";

import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (res.ok) window.location.href = "/";
    else setError((await res.json()).error || "Something went wrong");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="mb-1 text-xl font-semibold">📖💬 PustakLM</h1>
        <p className="mb-6 text-sm text-parchment-100/50">Your library. Now conversational.</p>

        <div className="space-y-3">
          <input
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-transparent p-3 text-sm outline-none focus:border-saffron-500/50"
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full rounded-xl border border-white/10 bg-transparent p-3 text-sm outline-none focus:border-saffron-500/50"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button onClick={submit} disabled={busy} className="btn-primary w-full justify-center">
            {busy ? "…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </div>

        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="mt-4 w-full text-center text-xs text-parchment-100/50 hover:text-parchment-50"
        >
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </div>
    </main>
  );
}
