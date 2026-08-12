"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    if (res.ok) {
      window.location.href = "/";
      return;
    }
    setBusy(false);
    setError((await res.json()).error || "Something went wrong");
  }

  async function useDemoUser() {
    setEmail("testuser@email.com");
    setPassword("12345678");
    setMode("login");
    setError("");
    setBusy(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "testuser@email.com", password: "12345678" }),
    });

    if (res.ok) {
      window.location.href = "/";
      return;
    }
    setBusy(false);
    setError((await res.json()).error || "Demo account sign-in failed");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent shadow-glow">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-fg">PustakLM</h1>
          <p className="mt-1 text-sm text-fg-secondary">Your library. Now conversational.</p>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="mb-5 flex rounded-xl bg-surface-elevated p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-all ${
                mode === "login" ? "bg-surface text-fg shadow-sm" : "text-fg-secondary hover:text-fg"
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-all ${
                mode === "register" ? "bg-surface text-fg shadow-sm" : "text-fg-secondary hover:text-fg"
              }`}
            >
              Sign up
            </button>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-fg-tertiary transition-colors hover:text-fg"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-sm text-error"
              >
                {error}
              </motion.p>
            )}
            <Button onClick={submit} disabled={busy} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Log in" : "Create account"}
            </Button>

            <Button variant="secondary" onClick={useDemoUser} disabled={busy} className="w-full">
              <Sparkles className="h-4 w-4" />
              Use demo account
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-fg-tertiary">
          Upload sources, ask questions, get cited answers.
        </p>
      </motion.div>
    </main>
  );
}
