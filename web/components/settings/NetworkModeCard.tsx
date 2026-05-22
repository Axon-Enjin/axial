"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

type ChainStatus = {
  l1ContractsDeployed: boolean;
  onChainReady: boolean;
  swapContractId: string | null;
  receivableContractId: string | null;
  payrollContractId: string | null;
  settlementContractId: string | null;
};

/**
 * Mainnet-only: Axial operates exclusively on Stellar Mainnet. This card is a
 * read-only status panel — there is no Testnet toggle.
 */
export function NetworkModeCard() {
  const [status, setStatus] = useState<ChainStatus | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/soroban/status", { cache: "no-store" });
    if (res.ok) {
      setStatus((await res.json()) as ChainStatus);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <Icon name="hub" className="text-primary" />
        <div className="min-w-0 flex-1">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Stellar network
          </h2>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
            Axial runs on{" "}
            <span className="text-on-surface">Stellar Mainnet</span> — Soroban
            contracts settled in Circle USDC. Real assets, live settlement.
          </p>
        </div>
      </div>

      {status ? (
        <ul className="mt-4 space-y-1 font-label-sm text-label-sm text-on-surface-variant">
          <li>
            Network: <span className="text-on-surface">Mainnet</span>
            {status.onChainReady
              ? " · on-chain ready"
              : " · demo mode — set MAINNET_* env"}
          </li>
          <li>
            Contracts:{" "}
            {status.l1ContractsDeployed
              ? "receivable + swap + payroll"
              : "not wired — MAINNET_* contract IDs missing"}
          </li>
        </ul>
      ) : null}
    </Card>
  );
}
