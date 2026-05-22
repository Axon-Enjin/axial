"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { getFreighterNetworkDetails } from "@/lib/soroban/freighter";

type FreighterConnectGateProps = {
  title?: string;
  description?: string;
  /** When true, renders a full-width blocking card (default). When false, inline compact banner. */
  blocking?: boolean;
};

export function FreighterConnectGate({
  title = "Connect Freighter to continue",
  description = "Tokenize receivables, receive swap advances, and sign payroll on your wallet. Axial does not proceed until Freighter is connected.",
  blocking = true,
}: FreighterConnectGateProps) {
  const {
    freighterPublicKey,
    freighterInstalled,
    freighterConnecting,
    connectFreighter,
  } = useApp();
  const [error, setError] = useState<string | null>(null);

  if (freighterPublicKey) return null;

  const handleConnect = async () => {
    setError(null);
    try {
      await connectFreighter();
      const details = await getFreighterNetworkDetails().catch(() => null);
      if (
        details?.networkPassphrase &&
        !details.networkPassphrase.includes("Public Global") &&
        !details.networkPassphrase.includes("Test SDF")
      ) {
        setError(
          "Freighter network not recognized. In Freighter → Settings, choose Mainnet.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  };

  const body = (
    <>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon name="account_balance_wallet" size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-headline-md text-headline-md text-on-surface">{title}</h3>
          <p className="mt-1.5 font-body-md text-body-md text-on-surface-variant">{description}</p>
        </div>
      </div>

      {error ? (
        <p className="font-body-md text-body-md text-red-400/90">{error}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {freighterInstalled ? (
          <Button
            variant="primary"
            onClick={() => void handleConnect()}
            disabled={freighterConnecting}
          >
            {freighterConnecting ? "Connecting…" : "Connect Freighter"}
          </Button>
        ) : (
          <>
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/60 px-4 py-2.5 font-body-md text-body-md text-on-surface transition-colors hover:bg-surface-container-high"
            >
              <Icon name="open_in_new" size={16} />
              Install Freighter
            </a>
            <Button
              variant="secondary"
              onClick={() => void handleConnect()}
              disabled={freighterConnecting}
            >
              Try connect
            </Button>
          </>
        )}
        <Link
          href="/app/settings"
          className="font-label-md text-label-md text-on-surface-variant hover:text-primary"
        >
          Wallet settings
        </Link>
      </div>
    </>
  );

  if (!blocking) {
    return (
      <div className="rounded-xl border border-violet-500/25 bg-violet-500/5 p-4 space-y-3">
        {body}
      </div>
    );
  }

  return (
    <Card className="border-violet-500/30 bg-violet-500/5 space-y-4">
      {body}
    </Card>
  );
}
