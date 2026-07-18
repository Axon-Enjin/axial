"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { StellarNetworkId } from "@/lib/soroban/network";

type NetworkStatus = {
  network: StellarNetworkId;
  label: string;
  onChainReady: boolean;
  l1ContractsDeployed: boolean;
  testnetWiredInRepo: boolean;
  mainnetWiredInRepo: boolean;
};

/**
 * Per-browser sandbox switch (cookie). Default remains Mainnet — the
 * production operating target. Testnet needs TESTNET_* env / deployments.
 */
export function NetworkModeCard() {
  const [status, setStatus] = useState<NetworkStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/network", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load network setting");
      setStatus((await res.json()) as NetworkStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load network");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function selectNetwork(network: StellarNetworkId) {
    if (busy || status?.network === network) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ network }),
      });
      const data = (await res.json()) as NetworkStatus & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not switch network");
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not switch network");
    } finally {
      setBusy(false);
    }
  }

  const selected = status?.network ?? "mainnet";

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <Icon name="hub" className="text-primary" />
        <div className="min-w-0 flex-1">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Stellar network
          </h2>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
            Default is{" "}
            <span className="text-on-surface">Mainnet</span> (live Circle USDC).
            Switch to Testnet for sandbox demos when{" "}
            <span className="font-mono text-[12px]">TESTNET_*</span> keys and
            contracts are configured. Match Freighter to the same network.
          </p>
        </div>
      </div>

      <div className="mt-4 flex rounded-lg border border-outline-variant/25 bg-surface-container/40 p-1">
        {(["mainnet", "testnet"] as const).map((n) => {
          const active = selected === n;
          return (
            <button
              key={n}
              type="button"
              disabled={busy}
              onClick={() => void selectNetwork(n)}
              className={[
                "flex-1 rounded-md px-3 py-2 font-label-md text-[13px] font-medium transition-colors",
                active
                  ? "bg-[#2DD4BF] text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface",
                busy ? "opacity-60" : "",
              ].join(" ")}
            >
              {n === "mainnet" ? "Mainnet" : "Testnet"}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mt-3 font-body-md text-body-md text-red-400/90">{error}</p>
      ) : null}

      {status ? (
        <ul className="mt-4 space-y-1 font-label-sm text-label-sm text-on-surface-variant">
          <li>
            Active: <span className="text-on-surface">{status.label}</span>
            {status.onChainReady
              ? " · on-chain ready"
              : selected === "testnet"
                ? " · sandbox — set TESTNET_* env / deployments/testnet.json"
                : " · demo mode — set MAINNET_* env"}
          </li>
          <li>
            Contracts:{" "}
            {status.l1ContractsDeployed
              ? "receivable + swap + payroll"
              : "not wired for this network"}
          </li>
        </ul>
      ) : null}
    </Card>
  );
}
