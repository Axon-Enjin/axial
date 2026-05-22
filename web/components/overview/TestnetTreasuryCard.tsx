"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { Icon } from "@/components/ui/Icon";

type WalletRow = {
  role: string;
  label: string;
  publicKey: string;
  xlm: string;
  usdc: string | null;
  explorerAccountUrl: string;
  friendbotUrl: string | null;
};

type BalancesResponse = {
  network: string;
  wallets: WalletRow[];
  faucets?: { xlm: string; usdc: string } | null;
  error?: string;
};

function shortKey(key: string) {
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

function usdcLow(usdc: string | null): boolean {
  if (!usdc) return true;
  const n = Number(usdc.replace(/,/g, ""));
  return !Number.isFinite(n) || n < 1;
}

export function TestnetTreasuryCard() {
  const [data, setData] = useState<BalancesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/wallets/balances", { cache: "no-store" });
      const json = (await res.json()) as BalancesResponse;
      if (!res.ok) throw new Error(json.error ?? "Failed to load balances");
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(true), 45_000);
    return () => window.clearInterval(id);
  }, [load]);

  if (loading && !data) {
    return (
      <Card>
        <CardHeader icon="account_balance_wallet" label="Testnet treasury" />
        <p className="font-body-md text-[13px] sm:text-body-md text-on-surface-variant">
          Reading Stellar balances…
        </p>
      </Card>
    );
  }

  if (!data?.wallets?.length) {
    return (
      <Card>
        <CardHeader icon="account_balance_wallet" label="Testnet treasury" />
        <p className="font-body-md text-[13px] sm:text-body-md text-on-surface-variant">
          Add wallet public keys in web/.env.local to show live balances.
        </p>
      </Card>
    );
  }

  const isTestnet = data.network !== "mainnet";

  return (
    <Card>
      <CardHeader
        icon="account_balance_wallet"
        label={isTestnet ? "Testnet treasury" : "Treasury balances"}
        action={
          <button
            type="button"
            onClick={() => void load(true)}
            className="font-label-sm text-[11px] sm:text-label-sm text-[#2DD4BF] hover:underline"
          >
            Refresh
          </button>
        }
      />
      <p className="mb-3 sm:mb-4 font-body-md text-[13px] sm:text-body-md text-on-surface-variant">
        {isTestnet
          ? "Free test XLM and USDC — fund via Friendbot and Circle faucet before swaps."
          : "Live balances for demo wallets configured in the environment."}
      </p>

      <div className="flex flex-col gap-2.5 sm:gap-3">
        {data.wallets.map((w) => (
          <div
            key={w.role}
            className="rounded-lg sm:rounded-xl border border-outline-variant/15 bg-surface-container-low p-3 sm:p-3.5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-body-md text-[13px] sm:text-body-md font-medium text-on-surface">
                  {w.label}
                </p>
                <a
                  href={w.explorerAccountUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 font-mono text-[11px] sm:text-xs text-on-surface-variant hover:text-[#2DD4BF] break-all"
                >
                  {shortKey(w.publicKey)}
                </a>
              </div>
              {w.friendbotUrl ? (
                <a
                  href={w.friendbotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-label-sm text-[11px] sm:text-label-sm text-[#2DD4BF] hover:underline shrink-0"
                >
                  + XLM
                </a>
              ) : null}
            </div>
            <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <p className="font-label-sm text-[10px] sm:text-label-sm uppercase tracking-wider text-outline">
                  XLM (fees)
                </p>
                <p className="mt-0.5 font-mono text-[12px] sm:text-sm text-on-surface">{w.xlm}</p>
              </div>
              <div>
                <p className="font-label-sm text-[10px] sm:text-label-sm uppercase tracking-wider text-outline">
                  USDC (swaps)
                </p>
                <p
                  className={[
                    "mt-0.5 font-mono text-[12px] sm:text-sm",
                    usdcLow(w.usdc) ? "text-amber-400/90" : "text-[#2DD4BF]",
                  ].join(" ")}
                >
                  {w.usdc ?? "—"}
                </p>
              </div>
            </div>
            {w.role === "funder" && usdcLow(w.usdc) ? (
              <p className="mt-2 flex items-center gap-1 font-label-sm text-[10px] sm:text-label-sm text-amber-400/90">
                <Icon name="info" size={12} className="sm:hidden shrink-0" />
                <Icon name="info" size={14} className="hidden sm:block shrink-0" />
                <span className="break-words">Low USDC — use Circle faucet before Tokenize &amp; Swap</span>
              </p>
            ) : null}
            {w.role === "msme" && usdcLow(w.usdc) ? (
              <p className="mt-2 flex items-center gap-1 font-label-sm text-[10px] sm:text-label-sm text-amber-400/90">
                <Icon name="info" size={12} className="sm:hidden shrink-0" />
                <Icon name="info" size={14} className="hidden sm:block shrink-0" />
                <span className="break-words">Fund after swap — payroll routes from this wallet</span>
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {isTestnet && data.faucets ? (
        <p className="mt-3 sm:mt-4 font-label-sm text-[11px] sm:text-label-sm text-on-surface-variant">
          USDC:{" "}
          <a
            href={data.faucets.usdc}
            target="_blank"
            rel="noreferrer"
            className="text-[#2DD4BF] hover:underline break-all"
          >
            Circle testnet faucet
          </a>
        </p>
      ) : null}
    </Card>
  );
}
