"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { getFreighterNetworkDetails } from "@/lib/soroban/freighter";
import {
  freighterMatchesNetwork,
  networkLabel,
  type StellarNetworkId,
} from "@/lib/soroban/network";

const MAINNET_FREIGHTER_PUBLIC =
  "GDSCTQZRRGF23F5GWNE3FYLLPEGO23BB3RQ6AYO5756C7A4HJLEXZVTQ";

function truncateKey(key: string): string {
  if (key.length <= 12) return key;
  return `${key.slice(0, 6)}…${key.slice(-6)}`;
}

function NetworkPill({
  matched,
  selected,
}: {
  matched: boolean;
  selected: StellarNetworkId;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 font-label-sm text-label-sm uppercase tracking-wider",
        matched
          ? "bg-violet-500/15 text-violet-400"
          : "bg-amber-500/15 text-amber-300",
      ].join(" ")}
    >
      {matched ? selected : "wrong network"}
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
  const [connectError, setConnectError] = useState<string | null>(null);
  const [axialNetwork, setAxialNetwork] = useState<StellarNetworkId>("mainnet");

  useEffect(() => {
    void fetch("/api/network", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { network?: StellarNetworkId }) => {
        if (d.network === "testnet" || d.network === "mainnet") {
          setAxialNetwork(d.network);
        }
      })
      .catch(() => null);
  }, []);

  const onSelectedNetwork = freighterMatchesNetwork(freighterNetwork, axialNetwork);
  const label = networkLabel(axialNetwork);

  const isDeployWallet =
    freighterPublicKey != null && freighterPublicKey === MAINNET_FREIGHTER_PUBLIC;

  const handleConnect = async () => {
    setConnectError(null);
    try {
      await connectFreighter();
      const details = await getFreighterNetworkDetails();
      if (!freighterMatchesNetwork(details, axialNetwork)) {
        setConnectError(
          `Freighter is not on ${label}. In Freighter → Settings → switch to ${label}, then connect again.`,
        );
      }
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
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-[#2DD4BF]/25 bg-[#2DD4BF]/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Freighter Wallet
              </span>
              {freighterNetwork ? (
                <NetworkPill matched={onSelectedNetwork} selected={axialNetwork} />
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
            {isDeployWallet && onSelectedNetwork && axialNetwork === "mainnet" ? (
              <p className="mt-2 font-body-sm text-body-sm text-violet-300/90">
                Mainnet deploy wallet — matches Axial issuer / funder / MSME config.
              </p>
            ) : null}
            {onSelectedNetwork &&
            axialNetwork === "mainnet" &&
            freighterPublicKey &&
            !isDeployWallet ? (
              <p className="mt-2 font-body-sm text-body-sm text-amber-300/90">
                Connected key differs from configured mainnet deploy wallet (
                {truncateKey(MAINNET_FREIGHTER_PUBLIC)}).
              </p>
            ) : null}
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant">
            Swap advances and minted receivables go directly to your Freighter wallet.
            Payroll splits are signed by you — not held by Axial.
          </p>

          {onSelectedNetwork && axialNetwork === "mainnet" && freighterPublicKey ? (
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3.5">
              <div className="mb-2 font-label-sm text-label-sm uppercase tracking-wider text-amber-200/90">
                Mainnet USDC
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Before swap or payroll on mainnet, add a{" "}
                <strong className="font-medium text-on-surface">USDC</strong> trustline in
                Freighter (Assets → Add → USDC). Without it, the atomic swap fails with SAC
                error #13.
              </p>
            </div>
          ) : null}

          {!onSelectedNetwork ? (
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3.5">
              <div className="mb-2 font-label-sm text-label-sm uppercase tracking-wider text-amber-200/90">
                Switch to {label}
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Axial is set to Stellar {label} in Settings. In Freighter → Settings → switch
                to {label}, disconnect, and connect again.
              </p>
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button variant="ghost" onClick={disconnectFreighter}>
              Disconnect Wallet
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
            <div className="mb-1.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Primary Treasury (Custodial)
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Axial holds the funder and MSME keys server-side. Connect Freighter to
              switch to self-custody mode — your wallet, your keys.
            </p>
            <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant/80">
              Match Freighter to the network selected under Stellar network ({label}).
              On Mainnet, fund with XLM and a USDC trustline before swap.
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
