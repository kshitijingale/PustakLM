"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const OAUTH_ERRORS: Record<string, string> = {
  oauth_denied: "Sign-in was cancelled.",
  oauth_state: "That sign-in link expired. Please try again.",
  oauth_failed: "OAuth sign-in failed. Please try again.",
  oauth_no_email: "Your OAuth account has no verified email address.",
  oauth_not_configured: "This sign-in method isn't configured yet.",
  oauth_rate_limited: "Too many attempts. Please wait a minute and try again.",
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.39-5.26 5.68.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.2.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

// Shows why an OAuth attempt failed (the callback redirects to /login?error=...).
// useSearchParams must live inside a <Suspense> boundary in the App Router.
function OAuthErrorNotice() {
  const params = useSearchParams();
  const code = params.get("error");
  if (!code) return null;
  const message = OAUTH_ERRORS[code] || "Sign-in failed. Please try again.";
  return <p className="mb-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{message}</p>;
}

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
          <Suspense fallback={null}>
            <OAuthErrorNotice />
          </Suspense>

          <div className="space-y-3">
            <Button variant="secondary" asChild className="w-full">
              <a href="/api/auth/oauth/google">
                <GoogleIcon />
                Continue with Google
              </a>
            </Button>
            <Button variant="secondary" asChild className="w-full">
              <a href="/api/auth/oauth/github">
                <GitHubIcon />
                Continue with GitHub
              </a>
            </Button>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-fg-tertiary">or continue with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mb-5 flex rounded-xl bg-surface-elevated p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-all ${
                mode === "login" ? "bg-surface text-fg shadow-sm" : "text-fg-secondary hover:text-fg"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-all ${
                mode === "register" ? "bg-surface text-fg shadow-sm" : "text-fg-secondary hover:text-fg"
              }`}
            >
              Sign up
            </button>
          </div>

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Log in" : "Create account"}
            </Button>

            <Button type="button" variant="secondary" onClick={useDemoUser} disabled={busy} className="w-full">
              <Sparkles className="h-4 w-4" />
              Use demo account
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-fg-tertiary">
          Upload sources, ask questions, get cited answers.
        </p>
      </motion.div>
    </main>
  );
}
