"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { fundTestnetAccount } from "@/lib/soroban/freighter";

function truncateKey(key: string): string {
  if (key.length <= 12) return key;
  return `${key.slice(0, 6)}…${key.slice(-6)}`;
}

function NetworkPill({ network }: { network: string }) {
  const isTestnet = network.toLowerCase().includes("testnet") || network === "TESTNET";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 font-label-sm text-label-sm uppercase tracking-wider",
        isTestnet
          ? "bg-[#2DD4BF]/15 text-[#2DD4BF]"
          : "bg-violet-500/15 text-violet-400",
      ].join(" ")}
    >
      {isTestnet ? "testnet" : network.toLowerCase()}
    </span>
  );
}

export function WalletCard() {
  const {
    freighterPublicKey,
    freighterNetwork,
    freighterInstalled,
    freighterConnecting,
    connectFreighter,
    disconnectFreighter,
  } = useApp();

  const [copyDone, setCopyDone] = useState(false);
  const [fundingState, setFundingState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [fundError, setFundError] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  const isTestnet =
    !freighterNetwork ||
    freighterNetwork.network.toLowerCase().includes("testnet") ||
    freighterNetwork.network === "TESTNET";

  const handleConnect = async () => {
    setConnectError(null);
    try {
      await connectFreighter();
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "Connection failed");
    }
  };

  const handleCopyKey = async () => {
    if (!freighterPublicKey) return;
    try {
      await navigator.clipboard.writeText(freighterPublicKey);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch {
      // Clipboard not available in some environments
    }
  };

  const handleFundTestnet = async () => {
    if (!freighterPublicKey) return;
    setFundingState("loading");
    setFundError(null);
    try {
      await fundTestnetAccount(freighterPublicKey);
      setFundingState("done");
    } catch (err) {
      setFundError(err instanceof Error ? err.message : "Faucet request failed");
      setFundingState("error");
    }
  };

  return (
    <Card>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Icon name="account_balance_wallet" size={22} />
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Stellar Wallet
          </h3>
        </div>
        {freighterPublicKey ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2DD4BF]/15 px-2.5 py-1 font-label-sm text-label-sm text-[#2DD4BF]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2DD4BF]" />
            Self-custody
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-outline" />
            Custodial
          </span>
        )}
      </div>

      {freighterPublicKey ? (
        // ── Connected state ──────────────────────────────────────────────────
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-[#2DD4BF]/25 bg-[#2DD4BF]/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Freighter Wallet
              </span>
              {freighterNetwork ? (
                <NetworkPill network={freighterNetwork.network} />
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-medium text-on-surface">
                {truncateKey(freighterPublicKey)}
              </span>
              <button
                type="button"
                onClick={handleCopyKey}
                className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:text-primary"
                title="Copy full public key"
              >
                <Icon name={copyDone ? "check" : "content_copy"} size={16} />
                {copyDone ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="mt-2 font-mono text-xs break-all text-on-surface-variant/60">
              {freighterPublicKey}
            </div>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant">
            Swap advances and minted receivables go directly to your Freighter wallet.
            Payroll splits are signed by you — not held by Axial.
          </p>

          {isTestnet ? (
            <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-3.5">
              <div className="mb-2 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Testnet Funding
              </div>
              <p className="mb-3 font-body-md text-body-md text-on-surface-variant">
                Your wallet needs testnet XLM to sign payroll transactions.
              </p>
              {fundError ? (
                <p className="mb-2 font-body-md text-body-md text-red-400/90">{fundError}</p>
              ) : null}
              {fundingState === "done" ? (
                <p className="font-body-md text-body-md text-[#2DD4BF]">
                  Funded with 10,000 testnet XLM.
                </p>
              ) : (
                <Button
                  variant="secondary"
                  onClick={handleFundTestnet}
                  disabled={fundingState === "loading"}
                >
                  {fundingState === "loading" ? "Requesting…" : "Fund via Stellar Testnet Faucet"}
                </Button>
              )}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button variant="ghost" onClick={disconnectFreighter}>
              Disconnect Wallet
            </Button>
          </div>
        </div>
      ) : (
        // ── Disconnected state ───────────────────────────────────────────────
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
            <div className="mb-1.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Primary Treasury (Custodial)
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Axial holds the funder and MSME keys server-side. Connect Freighter to
              switch to self-custody mode — your wallet, your keys.
            </p>
          </div>

          {connectError ? (
            <p className="font-body-md text-body-md text-red-400/90">{connectError}</p>
          ) : null}

          {freighterInstalled ? (
            <Button
              variant="primary"
              onClick={handleConnect}
              disabled={freighterConnecting}
            >
              {freighterConnecting ? "Connecting…" : "Connect Freighter"}
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Freighter is not installed in this browser.
              </p>
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-outline-variant/60 px-4 py-2.5 font-body-md text-body-md text-on-surface transition-colors hover:bg-surface-container-high"
              >
                <Icon name="open_in_new" size={16} />
                Install Freighter
              </a>
              <Button
                variant="ghost"
                onClick={handleConnect}
                disabled={freighterConnecting}
              >
                Try Connect Anyway
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
