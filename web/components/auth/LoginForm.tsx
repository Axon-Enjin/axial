"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser, isAuthConfigured } from "@/lib/supabase/browser";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type Step = "idle" | "loading" | "sent" | "error";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app";
  const paramError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(paramError);
  const authReady = isAuthConfigured();

  // ── Magic link ────────────────────────────────────────────────────────────
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStep("loading");
    setErrorMsg(null);

    try {
      const supabase = getSupabaseBrowser();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      setStep("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Sign-in failed");
      setStep("error");
    }
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────
  async function handleGoogle() {
    setStep("loading");
    setErrorMsg(null);
    try {
      const supabase = getSupabaseBrowser();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, queryParams: { access_type: "offline", prompt: "consent" } },
      });
      if (error) throw error;
      // Browser redirects — loading state stays
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "OAuth failed");
      setStep("error");
    }
  }

  // ── Demo bypass (no auth configured) ─────────────────────────────────────
  if (!authReady) {
    return (
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Icon name="info" size={20} className="text-[#2DD4BF]" />
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Demo mode
          </h2>
        </div>
        <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
          Auth is not configured — set{" "}
          <code className="rounded bg-surface-container px-1 font-mono text-xs text-[#2DD4BF]">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          to enable real auth. Proceeding without login.
        </p>
        <Button
          variant="primary"
          className="w-full"
          onClick={() => router.push(next)}
        >
          Enter demo
        </Button>
      </Card>
    );
  }

  // ── Magic link sent ───────────────────────────────────────────────────────
  if (step === "sent") {
    return (
      <Card>
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2DD4BF]/10">
            <Icon name="mark_email_read" size={24} className="text-[#2DD4BF]" />
          </span>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Check your inbox
            </h2>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              We sent a magic link to{" "}
              <strong className="text-on-surface">{email}</strong>.
              <br />
              Click it to sign in — no password needed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStep("idle")}
            className="font-label-sm text-label-sm text-on-surface-variant underline-offset-2 hover:text-on-surface hover:underline"
          >
            Use a different email
          </button>
        </div>
      </Card>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <Card>
      <div className="mb-6">
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Sign in to Axial
        </h2>
        <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
          New? Your account and org are created automatically.
        </p>
      </div>

      {errorMsg ? (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <Icon name="error_outline" size={18} className="mt-0.5 shrink-0 text-red-400" />
          <p className="font-body-md text-body-md text-red-300">{errorMsg}</p>
        </div>
      ) : null}

      {/* Magic link */}
      <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
        <div>
          <label
            htmlFor="email"
            className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant"
          >
            Work email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.ph"
            className="mt-1.5 w-full rounded-lg border border-outline-variant/60 bg-surface-container px-3 py-2.5 font-mono text-sm text-on-surface outline-none focus:border-primary placeholder:text-on-surface-variant/40"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={step === "loading" || !email.trim()}
        >
          {step === "loading" ? "Sending…" : "Send magic link"}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-outline-variant/20" />
        <span className="font-label-sm text-label-sm text-on-surface-variant/50">or</span>
        <div className="h-px flex-1 bg-outline-variant/20" />
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={step === "loading"}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-outline-variant/40 bg-surface-container px-4 py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50"
      >
        {/* Google "G" SVG */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p className="mt-5 text-center font-body-md text-body-md text-on-surface-variant/60 text-xs">
        By signing in you agree to Axial&apos;s terms of service.
        Data protected under the Philippine Data Privacy Act (RA 10173).
      </p>
    </Card>
  );
}
