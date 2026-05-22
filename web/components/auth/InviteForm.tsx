"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type InviteInfo = {
  orgName: string;
  email: string;
  role: string;
  inviterEmail: string;
  expired: boolean;
};

type Step = "loading" | "ready" | "accepting" | "done" | "error";

export function InviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [step, setStep] = useState<Step>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStep("error");
      setErrorMsg("Missing invite token.");
      return;
    }

    fetch(`/api/auth/invite?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setStep("error");
          setErrorMsg(data.error);
        } else {
          setInvite(data);
          if (data.expired) {
            setStep("error");
            setErrorMsg("This invite has expired. Ask your admin to resend.");
          } else {
            setStep("ready");
          }
        }
      })
      .catch(() => {
        setStep("error");
        setErrorMsg("Could not load invite details.");
      });
  }, [token]);

  async function handleAccept() {
    if (!token) return;
    setStep("accepting");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invite acceptance failed");
      setStep("done");
      setTimeout(() => router.push("/app"), 1500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Acceptance failed");
      setStep("error");
    }
  }

  if (step === "loading") {
    return (
      <Card>
        <div className="flex items-center gap-3 py-6">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <span className="font-body-md text-body-md text-on-surface-variant">
            Loading invite…
          </span>
        </div>
      </Card>
    );
  }

  if (step === "done") {
    return (
      <Card>
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2DD4BF]/10">
            <Icon name="check_circle" size={24} className="text-[#2DD4BF]" />
          </span>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Welcome to {invite?.orgName}
            </h2>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              Redirecting to your dashboard…
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (step === "error" || !invite) {
    return (
      <Card>
        <div className="mb-4 flex items-start gap-2">
          <Icon name="error_outline" size={20} className="mt-0.5 shrink-0 text-red-400" />
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Invalid invite
            </h2>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              {errorMsg ?? "This invite link is not valid."}
            </p>
          </div>
        </div>
        <Button variant="primary" className="w-full" onClick={() => router.push("/login")}>
          Back to sign in
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Icon name="group_add" size={22} className="text-primary" />
        </span>
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            You&apos;ve been invited
          </h2>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
            <strong className="text-on-surface">{invite.inviterEmail}</strong> invited you to join{" "}
            <strong className="text-on-surface">{invite.orgName}</strong> as a{" "}
            <strong className="text-on-surface">{invite.role}</strong>.
          </p>
          {invite.email ? (
            <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant/70">
              This invite is for <span className="text-on-surface">{invite.email}</span>.
            </p>
          ) : null}
        </div>
      </div>

      {errorMsg ? (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <Icon name="error_outline" size={18} className="mt-0.5 shrink-0 text-red-400" />
          <p className="font-body-md text-body-md text-red-300">{errorMsg}</p>
        </div>
      ) : null}

      <Button
        variant="primary"
        className="w-full"
        onClick={handleAccept}
        disabled={step === "accepting"}
      >
        {step === "accepting" ? "Joining…" : `Join ${invite.orgName}`}
      </Button>
    </Card>
  );
}
