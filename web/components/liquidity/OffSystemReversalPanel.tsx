"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useApp } from "@/components/providers/AppProvider";

type Props = {
  invoiceId: string;
  party: string;
  facePhp: number;
  onDone?: () => void;
  onCancel: () => void;
};

/**
 * Calm path when the payer wired fiat off-system: MSME deposits equivalent USDC
 * into the settlement lockbox so liability can clear before further recourse.
 */
export function OffSystemReversalPanel({
  invoiceId,
  party,
  facePhp,
  onDone,
  onCancel,
}: Props) {
  const { freighterPublicKey, connectFreighter, freighterNetwork, dispatch } = useApp();
  const [busy, setBusy] = useState(false);

  async function runReversal() {
    setBusy(true);
    try {
      let signer = freighterPublicKey;
      if (!signer) {
        signer = await connectFreighter();
      }

      const buildRes = await fetch("/api/lockbox/fund/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          amount: facePhp,
          payerPublic: signer,
        }),
      });
      const build = (await buildRes.json()) as {
        xdr?: string;
        networkPassphrase?: string;
        amountUsdc?: number;
        error?: string;
      };
      if (!buildRes.ok || !build.xdr) {
        dispatch("swap-executed", `failed:${build.error ?? "Could not build lockbox deposit"}`);
        return;
      }

      const { signXdrWithFreighter } = await import("@/lib/soroban/freighter");
      const signedXdr = await signXdrWithFreighter(build.xdr, {
        networkPassphrase:
          build.networkPassphrase ??
          freighterNetwork?.networkPassphrase ??
          "Public Global Stellar Network ; September 2015",
        accountToSign: signer,
      });

      const submitRes = await fetch("/api/tx/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xdr: signedXdr,
          context: "lockbox_fund",
          invoiceId,
          amountUsdc: build.amountUsdc,
        }),
      });
      const submit = (await submitRes.json()) as { txHash?: string; error?: string };
      if (!submitRes.ok || !submit.txHash) {
        dispatch("swap-executed", `failed:${submit.error ?? "Lockbox deposit failed"}`);
        return;
      }

      const collectRes = await fetch(`/api/invoices/${encodeURIComponent(invoiceId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark_collected",
          collectedAmount: build.amountUsdc,
        }),
      });
      if (!collectRes.ok) {
        const collect = (await collectRes.json()) as { error?: string };
        dispatch(
          "swap-executed",
          `failed:${collect.error ?? "Deposit landed; collection settle still needs attention"}`,
        );
        onDone?.();
        return;
      }

      dispatch("swap-executed", `Off-system funds re-routed · ${submit.txHash.slice(0, 10)}…`);
      onDone?.();
    } catch (err) {
      dispatch(
        "swap-executed",
        `failed:${err instanceof Error ? err.message : "Re-route cancelled"}`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="off-system-title"
    >
      <div className="w-full max-w-md rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2DD4BF]/40 bg-[#2DD4BF]/15 text-[#2DD4BF]">
            <Icon name="account_balance_wallet" size={20} />
          </div>
          <div>
            <h2 id="off-system-title" className="font-headline-md text-[18px] text-on-surface">
              Re-route to lockbox
            </h2>
            <p className="mt-1 font-body-md text-[13px] text-on-surface-variant">
              If the payer settled off-system, deposit the matching USDC into the designated
              lockbox so this deal can clear calmly.
            </p>
          </div>
        </div>
        <dl className="mb-4 space-y-2 rounded-lg border border-outline-variant/15 bg-surface-container/40 p-4 text-[13px]">
          <div className="flex justify-between gap-3">
            <dt className="text-on-surface-variant">Invoice</dt>
            <dd className="text-right text-on-surface">
              {invoiceId}
              <span className="mt-0.5 block text-on-surface-variant">{party}</span>
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-on-surface-variant">Face (PHP)</dt>
            <dd className="text-on-surface">
              {facePhp.toLocaleString("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 })}
            </dd>
          </div>
        </dl>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="teal"
            size="sm"
            glow
            disabled={busy}
            icon={busy ? "progress_activity" : "payments"}
            onClick={() => void runReversal()}
          >
            {busy ? "Depositing…" : "Deposit USDC to lockbox"}
          </Button>
        </div>
      </div>
    </div>
  );
}
