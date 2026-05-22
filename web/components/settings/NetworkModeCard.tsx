"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { StellarNetworkId } from "@/lib/soroban/network";

type ChainStatus = {
  network: StellarNetworkId;
  l1ContractsDeployed: boolean;
  mainnetAvailable: boolean;
  testnetAvailable: boolean;
  onChainReady: boolean;
  receivableReady: boolean;
  swapContractId: string | null;
  receivableContractId: string | null;
  payrollContractId: string | null;
};

export function NetworkModeCard() {
  const router = useRouter();
  const [status, setStatus] = useState<ChainStatus | null>(null);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/soroban/status", { cache: "no-store" });
    if (res.ok) {
      setStatus((await res.json()) as ChainStatus);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const switchNetwork = async (network: StellarNetworkId) => {
    setSwitching(true);
    setError(null);
    try {
      const res = await fetch("/api/soroban/network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ network }),
      });
      const data = (await res.json()) as ChainStatus & { error?: string };
      if (!res.ok) {
        setError(data.error ?? `Could not switch to ${network}`);
        return;
      }
      setStatus(data);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network switch failed");
    } finally {
      setSwitching(false);
    }
  };

  const active = status?.network ?? "testnet";

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <Icon name="hub" className="text-primary" />
        <div className="min-w-0 flex-1">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Stellar network
          </h2>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
            Testnet for daily demo · Mainnet after{" "}
            <code className="text-xs">mainnet-setup.sh</code> (3 contracts + Circle USDC).
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant={active === "testnet" ? "primary" : "secondary"}
          disabled={switching || active === "testnet"}
          onClick={() => void switchNetwork("testnet")}
        >
          Testnet
        </Button>
        <Button
          variant={active === "mainnet" ? "primary" : "secondary"}
          disabled={
            switching ||
            active === "mainnet" ||
            status?.mainnetAvailable === false
          }
          onClick={() => void switchNetwork("mainnet")}
        >
          Mainnet
        </Button>
      </div>

      {status?.mainnetAvailable === false && (
        <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">
          Mainnet: not deployed yet — only{" "}
          <span className="text-on-surface">testnet</span> is wired (see{" "}
          <code className="text-xs">soroban/deployments/mainnet.example.json</code>
          ).
        </p>
      )}

      {error ? (
        <p className="mt-3 font-body-sm text-body-sm text-error">{error}</p>
      ) : null}

      {status ? (
        <ul className="mt-4 space-y-1 font-label-sm text-label-sm text-on-surface-variant">
          <li>
            Active: <span className="text-on-surface">{status.network}</span>
            {status.onChainReady ? " · on-chain ready" : " · demo / missing secrets"}
          </li>
          <li>
            Contracts:{" "}
            {status.l1ContractsDeployed
              ? "receivable + swap + payroll"
              : "incomplete for this network"}
          </li>
        </ul>
      ) : null}
    </Card>
  );
}
