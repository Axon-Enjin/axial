"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useApp } from "@/components/providers/AppProvider";

type PayeeRow = { wallet: string; amountUsdc: string };

/**
 * Track A — pay independent contractors in USDC on Stellar Testnet.
 * Employees must use Track B (PHP legal tender).
 */
export function ContractorPayPanel({ contractReady }: { contractReady: boolean }) {
  const { freighterPublicKey, connectFreighter, freighterNetwork, dispatch } = useApp();
  const [rows, setRows] = useState<PayeeRow[]>([{ wallet: "", amountUsdc: "" }]);
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const updateRow = useCallback((index: number, patch: Partial<PayeeRow>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }, []);

  async function runBatch() {
    setBusy(true);
    setTxHash(null);
    try {
      let signer = freighterPublicKey;
      if (!signer) signer = await connectFreighter();

      const payees = rows.map((r) => ({
        wallet: r.wallet.trim(),
        amountUsdc: Number(r.amountUsdc),
      }));

      const batchId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? `CTR-${crypto.randomUUID()}`
          : `CTR-${Date.now()}`;

      const buildRes = await fetch("/api/payroll/contractors/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, payees, signerPublic: signer }),
      });
      const build = (await buildRes.json()) as {
        xdr?: string;
        networkPassphrase?: string;
        error?: string;
        quote?: { totalUsdc: number };
      };
      if (!buildRes.ok || !build.xdr) {
        dispatch("payroll-routed", build.error ?? "Contractor batch build failed");
        return;
      }

      const { signXdrWithFreighter } = await import("@/lib/soroban/freighter");
      const signedXdr = await signXdrWithFreighter(build.xdr, {
        networkPassphrase:
          build.networkPassphrase ??
          freighterNetwork?.networkPassphrase ??
          "Test SDF Network ; September 2015",
        accountToSign: signer,
      });

      const submitRes = await fetch("/api/tx/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xdr: signedXdr, context: "contractor_payroll" }),
      });
      const submit = (await submitRes.json()) as { txHash?: string; error?: string };
      if (!submitRes.ok || !submit.txHash) {
        dispatch("payroll-routed", submit.error ?? "Contractor batch submit failed");
        return;
      }
      setTxHash(submit.txHash);
      dispatch(
        "payroll-routed",
        `tx:${batchId}|${submit.txHash} · ${build.quote?.totalUsdc ?? ""} USDC to contractors`,
      );
    } catch (err) {
      dispatch(
        "payroll-routed",
        err instanceof Error ? err.message : "Contractor pay cancelled",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mt-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Pay contractors (USDC)
            </h3>
            <StatusBadge kind="scanning" icon="science">
              Testnet
            </StatusBadge>
          </div>
          <p className="mt-1 max-w-xl font-body-md text-[13px] text-on-surface-variant">
            Independent contractors only. Regular employees must receive PHP legal tender (Labor
            Code Art. 102) via the fiat-bridged Track B path.
          </p>
        </div>
        <Button
          variant="teal"
          size="sm"
          disabled={busy || !contractReady}
          onClick={() => void runBatch()}
        >
          {busy ? "Paying…" : "Pay on Testnet"}
        </Button>
      </div>

      {!contractReady ? (
        <p className="mb-3 font-body-md text-[13px] text-on-surface-variant">
          Deploy <code className="text-[#2DD4BF]">contractor_payroll</code> on Testnet and set{" "}
          <code className="text-[#2DD4BF]">TESTNET_CONTRACTOR_PAYROLL_CONTRACT_ID</code>.
        </p>
      ) : null}

      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_140px_auto]">
            <input
              className="rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2 font-mono text-[12px] text-on-surface"
              placeholder="Contractor G… wallet"
              value={row.wallet}
              onChange={(e) => updateRow(i, { wallet: e.target.value })}
            />
            <input
              className="rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2 font-mono text-[12px] text-on-surface"
              placeholder="USDC"
              inputMode="numeric"
              value={row.amountUsdc}
              onChange={(e) => updateRow(i, { amountUsdc: e.target.value })}
            />
            <button
              type="button"
              className="font-label-sm text-[12px] text-on-surface-variant hover:text-on-surface"
              onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
              disabled={rows.length <= 1}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRows((prev) => [...prev, { wallet: "", amountUsdc: "" }])}
        >
          Add payee
        </Button>
        {txHash ? (
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-label-md text-[12px] text-[#2DD4BF]"
          >
            <Icon name="receipt_long" size={16} />
            View Testnet TX
          </a>
        ) : null}
      </div>
    </Card>
  );
}
