"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { FlowPipeline } from "@/components/pipeline/FlowPipeline";
import type { SettlePipelineStage } from "@/lib/pipeline/configs";
import { settlePipelineSteps } from "@/lib/pipeline/configs";
import type { NoticeOfAssignment } from "@/lib/payers/types";
import {
  getFreighterPublicKey,
  signXdrWithFreighter,
} from "@/lib/soroban/freighter";

type Step = "loading" | "confirm" | "noa" | "done" | "paid" | "error";

type ConfirmData = {
  confirmation: {
    id: string;
    receivableId: string;
    confirmedAmount: number;
    dueDate: string;
    status: string;
    authToken: string;
  };
  noa?: NoticeOfAssignment;
};

type ChainStatus = {
  network?: string;
  networkPassphrase?: string;
  lockboxFundingReady?: boolean;
  explorerTxBase?: string;
};

type Props = {
  token?: string;
  invoiceId?: string;
};

/**
 * Payer-facing portal — accessed via magic link from the MSME.
 * Flow: confirm invoice → auto-issued NoA → acknowledge NoA → pay lockbox (Freighter).
 */
export function PayerPortalView({ token, invoiceId }: Props) {
  const [step, setStep] = useState<Step>("loading");
  const [data, setData] = useState<ConfirmData | null>(null);
  const [noa, setNoa] = useState<NoticeOfAssignment | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [chain, setChain] = useState<ChainStatus>({});
  const [freighterPublic, setFreighterPublic] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payTxHash, setPayTxHash] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [settleStage, setSettleStage] = useState<SettlePipelineStage>("idle");
  const [settleTxHash, setSettleTxHash] = useState<string | null>(null);
  const [settleError, setSettleError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/soroban/status")
      .then((r) => r.json())
      .then((d: ChainStatus) => setChain(d))
      .catch(() => null);
  }, []);

  // On mount: pre-validate token by fetching the confirmation record
  useEffect(() => {
    if (!token || !invoiceId) {
      setStep("error");
      setErrorMsg("Missing confirmation link parameters. Contact the MSME who sent this link.");
      return;
    }

    void fetch(`/api/invoices/${encodeURIComponent(invoiceId)}/confirm`)
      .then((r) => r.json())
      .then((d: { confirmation?: ConfirmData["confirmation"] }) => {
        if (d.confirmation?.status === "confirmed") {
          setData({ confirmation: d.confirmation });
          void fetch(`/api/noa/${encodeURIComponent(invoiceId)}/ack`)
            .then((r) => r.json())
            .then((nd: { noa?: NoticeOfAssignment }) => {
              if (nd.noa?.ackStatus === "acknowledged") {
                setNoa(nd.noa);
                setStep("done");
              } else {
                setNoa(nd.noa ?? null);
                setStep("noa");
              }
            });
        } else if (d.confirmation) {
          setData({ confirmation: d.confirmation });
          setStep("confirm");
        } else {
          setStep("confirm");
        }
      })
      .catch(() => {
        setStep("confirm");
      });
  }, [token, invoiceId]);

  const handleConfirm = async () => {
    if (!token || !invoiceId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/invoices/${encodeURIComponent(invoiceId)}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = (await res.json()) as {
        confirmation?: ConfirmData["confirmation"];
        noa?: NoticeOfAssignment;
        error?: string;
      };
      if (!res.ok) {
        setErrorMsg(result.error ?? "Confirmation failed. Please try again.");
        setStep("error");
        return;
      }
      setData({ confirmation: result.confirmation!, noa: result.noa });
      setNoa(result.noa ?? null);
      setStep("noa");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStep("error");
    } finally {
      setBusy(false);
    }
  };

  const handleAckNoa = async () => {
    if (!invoiceId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/noa/${encodeURIComponent(invoiceId)}/ack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ackMethod: "in_app" }),
      });
      const result = (await res.json()) as {
        noa?: NoticeOfAssignment;
        fundable?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setErrorMsg(result.error ?? "Acknowledgement failed. Please try again.");
        return;
      }
      setNoa(result.noa ?? null);
      setStep("done");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleConnectFreighter = async () => {
    setPayError(null);
    setPaying(true);
    try {
      const pub = await getFreighterPublicKey();
      setFreighterPublic(pub);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not connect Freighter";
      setPayError(msg);
    } finally {
      setPaying(false);
    }
  };

  const handlePayInvoice = async () => {
    if (!invoiceId || !freighterPublic || amount == null) return;
    setPayError(null);
    setSettleError(null);
    setPaying(true);
    setSettleStage("funding");
    try {
      const buildRes = await fetch("/api/lockbox/fund/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: rid,
          amount,
          payerPublic: freighterPublic,
        }),
      });
      const build = (await buildRes.json()) as {
        xdr?: string;
        networkPassphrase?: string;
        error?: string;
      };
      if (!buildRes.ok || !build.xdr) {
        setPayError(build.error ?? "Could not build payment transaction.");
        setSettleStage("idle");
        return;
      }

      const signedXdr = await signXdrWithFreighter(build.xdr, {
        networkPassphrase: build.networkPassphrase ?? chain.networkPassphrase,
        accountToSign: freighterPublic,
      });

      const submitRes = await fetch("/api/tx/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xdr: signedXdr, context: "lockbox_fund" }),
      });
      const submit = (await submitRes.json()) as { txHash?: string; error?: string };
      if (!submitRes.ok || !submit.txHash) {
        setPayError(submit.error ?? "Payment submission failed.");
        setSettleStage("idle");
        return;
      }

      setPayTxHash(submit.txHash);
      setSettleStage("collecting");

      const collectRes = await fetch(`/api/invoices/${encodeURIComponent(rid)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark_collected",
          collectedAmount: amount,
        }),
      });
      const collect = (await collectRes.json()) as {
        settlement?: { txHash?: string; error?: string; effectiveCollected?: number };
        warning?: string;
        error?: string;
      };

      if (!collectRes.ok) {
        setSettleError(collect.warning ?? collect.error ?? "Collection recorded failed.");
        setSettleStage("collecting");
        setStep("paid");
        return;
      }

      setSettleStage("settling");
      const settleHash = collect.settlement?.txHash;
      if (settleHash) {
        setSettleTxHash(settleHash);
      }
      if (collect.settlement?.error) {
        setSettleError(collect.settlement.error);
        setSettleStage("settling");
      } else {
        setSettleStage("complete");
      }
      setStep("paid");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setPayError(msg);
      setSettleStage("idle");
    } finally {
      setPaying(false);
    }
  };

  const amount = data?.confirmation.confirmedAmount;
  const due = data?.confirmation.dueDate;
  const rid = data?.confirmation.receivableId ?? invoiceId ?? "—";
  const isMainnet = chain.network === "mainnet";
  const canPay = Boolean(chain.lockboxFundingReady && noa?.lockboxAddress);

  const txExplorerUrl =
    payTxHash && chain.explorerTxBase
      ? `${chain.explorerTxBase}/${payTxHash}`
      : payTxHash
        ? `https://stellar.expert/explorer/public/tx/${payTxHash}`
        : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <LogoMark size={28} className="text-primary" />
        <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
          Axial
        </span>
        <span className="ml-1 rounded-full border border-outline-variant/20 px-2.5 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
          Payer Portal
        </span>
      </div>

      <div className="w-full max-w-md">
        {step === "loading" && (
          <Card className="text-center">
            <div className="py-8">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-outline-variant/30 border-t-primary" />
              <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
            </div>
          </Card>
        )}

        {step === "confirm" && (
          <Card>
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-label-sm text-label-sm text-primary">
                  Step 1 of 2
                </span>
              </div>
              <h1 className="font-headline-md text-headline-md tracking-tight text-on-surface">
                Confirm Invoice
              </h1>
              <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                Review and confirm that you owe the following invoice to the MSME.
              </p>
            </div>

            <div className="mb-6 space-y-3 rounded-xl border border-outline-variant/15 bg-surface-container-high/40 p-4">
              <Row label="Invoice ID" value={rid} mono />
              {amount != null && (
                <Row label="Amount" value={`₱${amount.toLocaleString()}`} accent />
              )}
              {due && <Row label="Due Date" value={due} />}
            </div>

            <div className="mb-6 rounded-xl border border-[#2DD4BF]/15 bg-[#2DD4BF]/5 p-4">
              <p className="font-label-sm text-label-sm text-[#2DD4BF]/80">
                By confirming, you acknowledge this invoice is valid and the amount is owed.
                A Notice of Assignment will be issued and you will be directed to pay the
                designated lockbox address at maturity.
              </p>
            </div>

            <Button variant="teal" fullWidth onClick={() => void handleConfirm()} disabled={busy}>
              {busy ? "Confirming…" : "Confirm Invoice"}
            </Button>
          </Card>
        )}

        {step === "noa" && (
          <Card>
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-[#2DD4BF]/10 px-2.5 py-0.5 font-label-sm text-label-sm text-[#2DD4BF]">
                  Step 2 of 2
                </span>
              </div>
              <h1 className="font-headline-md text-headline-md tracking-tight text-on-surface">
                Acknowledge Notice of Assignment
              </h1>
              <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                This invoice has been assigned to a funding partner. By acknowledging,
                you agree to pay the lockbox address at maturity.
              </p>
            </div>

            {noa && (
              <div className="mb-6 space-y-3 rounded-xl border border-outline-variant/15 bg-surface-container-high/40 p-4">
                <Row label="NoA Reference" value={noa.noaDocumentRef} mono />
                <CopyRow label="Lockbox Address" value={noa.lockboxAddress} />
                <Row label="Invoice ID" value={rid} mono />
                {amount != null && <Row label="Amount" value={`₱${amount.toLocaleString()}`} accent />}
                {due && <Row label="Due Date" value={due} />}
              </div>
            )}

            <div className="mb-4 rounded-xl border border-outline-variant/15 bg-surface-container-high/30 p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Under Philippine Civil Code §1624–1635, this Notice of Assignment legally
                redirects your payment obligation to the lockbox address. Payment to any
                other address will not discharge this debt.
              </p>
            </div>

            <Button variant="teal" fullWidth onClick={() => void handleAckNoa()} disabled={busy}>
              {busy ? "Acknowledging…" : "I Acknowledge the Notice of Assignment"}
            </Button>
          </Card>
        )}

        {step === "done" && (
          <Card>
            <div className="py-2 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/10">
                <Icon name="check_circle" size={28} className="text-[#2DD4BF]" />
              </div>
              <h1 className="mb-2 font-headline-md text-headline-md tracking-tight text-on-surface">
                All done
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Invoice confirmed and Notice of Assignment acknowledged.
              </p>
              {noa && (
                <p className="mt-3 font-label-sm text-label-sm text-outline">
                  Reference: {noa.noaDocumentRef}
                </p>
              )}
            </div>

            {noa && (
              <div className="mb-6 space-y-3 rounded-xl border border-outline-variant/15 bg-surface-container-high/40 p-4">
                <CopyRow label="Lockbox Address" value={noa.lockboxAddress} />
                {amount != null && (
                  <Row label="Amount due" value={`₱${amount.toLocaleString()}`} accent />
                )}
                {due && <Row label="Due Date" value={due} />}
              </div>
            )}

            {canPay && (
              <div className="space-y-3">
                {isMainnet && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-center">
                    <span className="font-label-sm text-label-sm text-amber-200/90">
                      Mainnet — real USDC
                    </span>
                  </div>
                )}

                {payError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                    <p className="font-label-sm text-label-sm text-red-300">{payError}</p>
                    {payError.includes("Freighter extension not installed") && (
                      <a
                        href="https://www.freighter.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block font-label-sm text-label-sm text-[#2DD4BF] hover:underline"
                      >
                        Install Freighter →
                      </a>
                    )}
                  </div>
                )}

                {!freighterPublic ? (
                  <Button
                    variant="teal"
                    fullWidth
                    onClick={() => void handleConnectFreighter()}
                    disabled={paying}
                  >
                    {paying ? "Connecting…" : "Connect wallet to pay"}
                  </Button>
                ) : (
                  <>
                    <p className="text-center font-label-sm text-label-sm text-on-surface-variant">
                      Wallet{" "}
                      <span className="font-mono text-on-surface">
                        {freighterPublic.slice(0, 8)}…{freighterPublic.slice(-6)}
                      </span>
                    </p>
                    <Button
                      variant="teal"
                      fullWidth
                      onClick={() => void handlePayInvoice()}
                      disabled={paying || amount == null}
                    >
                      {paying
                        ? "Processing…"
                        : `Pay invoice now (${amount?.toLocaleString() ?? "—"} USDC units)`}
                    </Button>
                  </>
                )}
              </div>
            )}
          </Card>
        )}

        {step === "paid" && (
          <Card>
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/10">
                <Icon name="payments" size={28} className="text-[#2DD4BF]" />
              </div>
              <h1 className="mb-2 font-headline-md text-headline-md tracking-tight text-on-surface">
                {settleStage === "complete" ? "Payment & settlement complete" : "Payment submitted"}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {settleStage === "complete"
                  ? "Lockbox funded and on-chain settle distributed to funder + MSME."
                  : "USDC transfer to the lockbox is on-chain."}
              </p>
              {payTxHash && txExplorerUrl && (
                <a
                  href={txExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block font-mono text-sm text-[#2DD4BF] hover:underline"
                >
                  Fund tx {payTxHash.slice(0, 16)}…
                </a>
              )}
              {settleTxHash && chain.explorerTxBase && (
                <a
                  href={`${chain.explorerTxBase}/${settleTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block font-mono text-sm text-[#2DD4BF] hover:underline"
                >
                  Settle tx {settleTxHash.slice(0, 16)}…
                </a>
              )}
              {settleError && (
                <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 font-label-sm text-label-sm text-amber-200/90">
                  {settleError}
                </p>
              )}
            </div>
            <div className="mt-4 border-t border-outline-variant/10 pt-4">
              <p className="mb-4 font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                Settlement pipeline
              </p>
              <FlowPipeline steps={settlePipelineSteps(settleStage)} />
            </div>
          </Card>
        )}

        {step === "error" && (
          <Card className="text-center">
            <div className="py-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
                <Icon name="error_outline" size={28} className="text-red-400" />
              </div>
              <h1 className="mb-2 font-headline-md text-headline-md tracking-tight text-on-surface">
                Link invalid
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {errorMsg ?? "This confirmation link is invalid or has expired."}
              </p>
            </div>
          </Card>
        )}

        <p className="mt-6 text-center font-label-sm text-label-sm text-outline">
          Powered by Axial · Stellar · Philippine MSME liquidity infrastructure
        </p>
        <p className="mt-2 text-center">
          <Link
            href="/"
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary"
          >
            Learn about Axial →
          </Link>
        </p>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span>
      <span
        className={[
          "text-right break-all",
          mono ? "font-mono text-sm text-on-surface" : "font-body-md text-body-md",
          accent ? "font-semibold text-[#2DD4BF]" : "text-on-surface",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [value]);

  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 font-label-sm text-label-sm text-on-surface-variant">
        {label}
      </span>
      <div className="flex min-w-0 items-start gap-2">
        <span className="break-all text-right font-mono text-xs text-on-surface">{value}</span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="shrink-0 rounded-md p-1 text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface"
          aria-label={`Copy ${label}`}
        >
          <Icon name={copied ? "check" : "content_copy"} size={16} />
        </button>
      </div>
    </div>
  );
}
