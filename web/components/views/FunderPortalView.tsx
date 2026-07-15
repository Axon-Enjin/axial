"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FunderProtectionCenter } from "@/components/funder/FunderProtectionCenter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { LogoMark } from "@/components/ui/Logo";
import type { FunderPortalAccess } from "@/lib/funder/portal-auth";

type ChainStatus = {
  network?: string;
  onChainReady?: boolean;
  funderPublic?: string | null;
  explorerTxBase?: string;
};

type Props = {
  access: FunderPortalAccess;
  token?: string;
};

export function FunderPortalView({ access, token }: Props) {
  const [chain, setChain] = useState<ChainStatus>({});
  const [treasuryUsdc, setTreasuryUsdc] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState(token ?? "");
  const [checking, setChecking] = useState(false);
  const [clientAccess, setClientAccess] = useState(access);

  useEffect(() => {
    setClientAccess(access);
  }, [access]);

  useEffect(() => {
    void fetch("/api/soroban/status")
      .then((r) => r.json())
      .then((d: ChainStatus) => setChain(d))
      .catch(() => null);

    void fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then((d: { treasury?: { funderUsdc?: string | null } }) =>
        setTreasuryUsdc(d.treasury?.funderUsdc ?? null),
      )
      .catch(() => setTreasuryUsdc(null));
  }, []);

  const tryToken = useCallback(async () => {
    if (!tokenInput.trim()) return;
    setChecking(true);
    try {
      const res = await fetch(
        `/api/funder/portal/access?token=${encodeURIComponent(tokenInput.trim())}`,
      );
      const data = (await res.json()) as FunderPortalAccess & { error?: string };
      if (data.authorized) {
        setClientAccess(data);
        const url = new URL(window.location.href);
        url.searchParams.set("token", tokenInput.trim());
        window.history.replaceState({}, "", url.toString());
      }
    } finally {
      setChecking(false);
    }
  }, [tokenInput]);

  if (!clientAccess.authorized) {
    return (
      <PortalShell>
        <Card className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-outline-variant/30 bg-surface-container-high/60">
              <Icon name="shield" size={28} className="text-primary" />
            </div>
            <h1 className="font-headline-md text-headline-md tracking-tight text-on-surface">
              Funder portal access
            </h1>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              Enter the access token from your MSME partner, or sign in to the Axial app to
              preview this book.
            </p>
          </div>

          <label className="mb-2 block font-label-sm text-label-sm text-on-surface-variant">
            Portal token
          </label>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste token from invite link"
            className="mb-4 w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-3 py-2.5 font-mono text-sm text-on-surface outline-none focus:border-primary/50"
          />

          <Button
            variant="teal"
            fullWidth
            disabled={checking || !tokenInput.trim()}
            onClick={() => void tryToken()}
          >
            {checking ? "Verifying…" : "Open funder book"}
          </Button>

          <p className="mt-4 text-center">
            <Link
              href="/login?next=/app/funder-portal"
              className="font-label-sm text-label-sm text-primary hover:underline"
            >
              Sign in as MSME operator →
            </Link>
          </p>
        </Card>
      </PortalShell>
    );
  }

  const modeLabel =
    clientAccess.mode === "token"
      ? "External LP · read-only"
      : clientAccess.mode === "session"
        ? "Org preview · read-only"
        : "Demo · read-only";

  return (
    <PortalShell wide>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            {modeLabel}
          </p>
          {chain.funderPublic ? (
            <p className="mt-1 font-mono text-xs text-outline">
              Treasury {chain.funderPublic.slice(0, 12)}… · {chain.network ?? "mainnet"}
            </p>
          ) : null}
        </div>
        {clientAccess.mode === "session" ? (
          <Link href="/app/liquidity#funder-book">
            <Button variant="ghost" size="sm">
              Open in Liquidity
            </Button>
          </Link>
        ) : null}
      </div>

      <FunderProtectionCenter
        explorerTxBase={
          chain.explorerTxBase ?? "https://stellar.expert/explorer/public/tx"
        }
        treasuryUsdc={treasuryUsdc}
        showShareLink={clientAccess.mode === "session" || clientAccess.mode === "dev"}
        embedded={false}
      />
    </PortalShell>
  );
}

function PortalShell({
  children,
  wide,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto mb-8 flex max-w-container-max items-center gap-3">
        <LogoMark size={28} className="text-primary" />
        <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
          Axial
        </span>
        <span className="ml-1 rounded-full border border-outline-variant/20 px-2.5 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
          Funder Portal
        </span>
      </div>

      <div className={wide ? "mx-auto max-w-container-max" : "mx-auto flex justify-center"}>
        {children}
      </div>

      <p className="mx-auto mt-8 max-w-container-max text-center font-label-sm text-label-sm text-outline">
        Read-only book · Powered by Axial · Stellar Mainnet ·{" "}
        <Link href="/app/settings" className="text-on-surface-variant hover:text-primary">
          Trust &amp; boundary
        </Link>
      </p>
      <p className="mt-2 text-center">
        <Link
          href="/"
          className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary"
        >
          Learn about Axial →
        </Link>
      </p>
    </main>
  );
}
