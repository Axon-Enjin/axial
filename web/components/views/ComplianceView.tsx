"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { EisPayloadPanel } from "@/components/compliance/EisPayloadPanel";
import { PayrollConfirmPanel } from "@/components/compliance/PayrollConfirmPanel";
import { FlowPipeline } from "@/components/pipeline/FlowPipeline";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { BirEisPayload } from "@/lib/eis/types";
import type { PayrollPipelineStage } from "@/lib/pipeline/configs";
import { payrollPipelineSteps } from "@/lib/pipeline/configs";
import { formatStatutoryLabel, getEffectiveStatutoryRates } from "@/lib/payroll/statutory-tables";

/** Demo payroll pool when no swap yet — matches ~85% advance on ₱125k invoice. */
const FALLBACK_GROSS = 106_250;

function formatAmount(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatBlock({
  label,
  value,
  badge,
  badgeAccent,
}: {
  label: string;
  value: string;
  badge?: string;
  badgeAccent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-outline-variant/10 bg-surface-container-low p-4">
      <div className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
        {label}
      </div>
      <div className="mt-2.5 font-headline-md text-headline-md text-on-surface">{value}</div>
      {badge ? (
        <div
          className={[
            "mt-1.5 font-label-sm text-label-sm",
            badgeAccent ? "text-[#2DD4BF]" : "text-on-surface-variant",
          ].join(" ")}
        >
          {badge}
        </div>
      ) : null}
    </div>
  );
}

function Milestone({
  date,
  title,
  sub,
  status,
}: {
  date: string;
  title: string;
  sub: string;
  status: "active" | "upcoming";
}) {
  return (
    <div className="relative z-10 flex gap-4">
      <div
        className={[
          "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
          status === "active"
            ? "bg-[#2DD4BF] shadow-[0_0_10px_rgba(45,212,191,0.6)]"
            : "bg-outline",
        ].join(" ")}
      />
      <div>
        <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          {date}
        </div>
        <div className="mt-1 font-body-md text-body-md font-medium text-on-surface">{title}</div>
        <div
          className={[
            "mt-0.5 font-body-md text-body-md",
            status === "active" ? "text-[#2DD4BF]" : "text-on-surface-variant",
          ].join(" ")}
        >
          {sub}
        </div>
      </div>
    </div>
  );
}

function SplitTile({
  icon,
  name,
  amount,
  pct,
}: {
  icon: string;
  name: string;
  amount: string;
  pct: number;
}) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="font-body-md text-body-md font-medium text-on-surface">{name}</span>
        <Icon name={icon} size={18} className="text-[#2DD4BF]" />
      </div>
      <div className="font-headline-md text-headline-md tracking-tight text-on-surface">
        <span className="mr-1 font-medium text-on-surface-variant">₱</span>
        {amount}
      </div>
      <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-surface-container-high">
        <div className="h-full bg-[#2DD4BF]" style={{ width: `${Math.min(pct * 100, 100)}%` }} />
      </div>
    </div>
  );
}

type EisRow = {
  id: string;
  payloadId?: string;
  date: string;
  ref: string;
  status: "Synchronized" | "Bridging" | "Awaiting review" | "Failed";
  pipelineStatus?: string;
  memoTxHash?: string | null;
  memoText?: string | null;
  stellarTxHash?: string;
  eventKind?: string;
  referenceId?: string;
  payload?: BirEisPayload;
  jwsPreview?: string;
  error?: string;
};

type EisStats = {
  pending: number;
  synchronized: number;
  total: number;
};

type PayrollQuote = {
  gross: number;
  sss: number;
  philhealth: number;
  pagibig: number;
  net: number;
};

type ChainStatus = {
  network: string;
  payrollReady: boolean;
  payrollContractId: string | null;
  explorerContractBase: string;
  explorerTxBase: string;
};

export function ComplianceView() {
  const {
    dispatch,
    lastSwapAdvancePhp,
    freighterPublicKey,
    freighterNetwork,
    connectFreighter,
  } = useApp();
  const walletReady = Boolean(freighterPublicKey);
  const [chain, setChain] = useState<ChainStatus | null>(null);
  const [quote, setQuote] = useState<PayrollQuote | null>(null);
  const [routing, setRouting] = useState(false);
  const [routed, setRouted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [eisRows, setEisRows] = useState<EisRow[]>([]);
  const [expandedPayloadId, setExpandedPayloadId] = useState<string | null>(null);
  const [eisStats, setEisStats] = useState<EisStats>({
    pending: 0,
    synchronized: 0,
    total: 0,
  });
  const [payrollStage, setPayrollStage] = useState<PayrollPipelineStage>("idle");
  const [pendingPayrollConfirm, setPendingPayrollConfirm] = useState(false);

  const gross = lastSwapAdvancePhp ?? FALLBACK_GROSS;
  const explorerTx =
    chain?.explorerTxBase ?? "https://stellar.expert/explorer/public/tx";

  const loadEis = useCallback(() => {
    fetch("/api/eis/submissions")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.submissions)) {
          setEisRows(d.submissions as EisRow[]);
        }
        if (d.stats) {
          setEisStats(d.stats as EisStats);
        }
      })
      .catch(() => {
        setEisRows([]);
      });
  }, []);

  useEffect(() => {
    fetch("/api/soroban/status")
      .then((r) => r.json())
      .then((d) => setChain(d as ChainStatus))
      .catch(() => setChain(null));
    loadEis();
    const id = window.setInterval(loadEis, 8000);
    return () => window.clearInterval(id);
  }, [loadEis]);

  useEffect(() => {
    fetch(`/api/payroll/quote?gross=${gross}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.gross != null) {
          setQuote({
            gross: d.gross,
            sss: d.sss,
            philhealth: d.philhealth,
            pagibig: d.pagibig,
            net: d.net,
          });
        }
      })
      .catch(() => setQuote(null));
  }, [gross]);

  const routePayroll = useCallback(async () => {
    let signer = freighterPublicKey;
    if (!signer) {
      try {
        signer = await connectFreighter();
      } catch (err) {
        dispatch(
          "payroll-routed",
          err instanceof Error ? err.message : "Connect Freighter before routing payroll",
        );
        return;
      }
    }

    setRouting(true);
    setPayrollStage("quoting");
    const payrollId = `PAY-${Date.now()}`;

    try {
      if (signer) {
        const buildRes = await fetch("/api/payroll/build", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payrollId, grossAmount: gross, signerPublic: signer }),
        });
        const buildData = (await buildRes.json()) as {
          xdr?: string;
          networkPassphrase?: string;
          quote?: { sss: number; philhealth: number; pagibig: number; net: number };
          error?: string;
        };
        if (!buildRes.ok || !buildData.xdr) {
          dispatch("payroll-routed", buildData.error ?? `Payroll build failed (${buildRes.status})`);
          setPayrollStage("idle");
          return;
        }

        setPayrollStage("routing");

        let signedXdr: string;
        try {
          const { signXdrWithFreighter } = await import("@/lib/soroban/freighter");
          signedXdr = await signXdrWithFreighter(buildData.xdr, {
            networkPassphrase:
              buildData.networkPassphrase ??
              freighterNetwork?.networkPassphrase ??
              "Test SDF Network ; September 2015",
            accountToSign: signer,
          });
        } catch (signErr) {
          dispatch(
            "payroll-routed",
            signErr instanceof Error ? signErr.message : "Freighter signing cancelled",
          );
          setPayrollStage("idle");
          return;
        }

        const submitRes = await fetch("/api/tx/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ xdr: signedXdr, context: "payroll" }),
        });
        const submitData = (await submitRes.json()) as { txHash?: string; error?: string };
        if (!submitRes.ok) {
          dispatch("payroll-routed", submitData.error ?? `Payroll submit failed (${submitRes.status})`);
          setPayrollStage("idle");
          return;
        }

        if (buildData.quote) {
          setQuote({ gross, ...buildData.quote });
        }
        setRouted(true);
        setPayrollStage("complete");
        const hash = submitData.txHash ?? "";
        if (hash) {
          setTxHash(hash);
          dispatch("payroll-routed", `tx:${payrollId}|${hash}`);
        } else {
          dispatch("payroll-routed", payrollId);
        }
        window.setTimeout(loadEis, 4000);
      }
    } finally {
      setRouting(false);
    }
  }, [dispatch, gross, loadEis, freighterPublicKey, freighterNetwork, connectFreighter]);

  const sssAmt = quote?.sss ?? 0;
  const philAmt = quote?.philhealth ?? 0;
  const pagAmt = quote?.pagibig ?? 0;
  const netAmt = quote?.net ?? 0;
  const grossForPct = quote?.gross ?? gross;

  return (
    <main className="compliance-route mx-auto max-w-container-max space-y-4 sm:space-y-5 md:space-y-gutter px-4 py-5 sm:px-6 sm:py-6 md:px-margin-desktop md:py-7">
      {chain ? (
        <div
          className={[
            "flex flex-wrap items-center gap-2 rounded-lg sm:rounded-xl border px-3 py-2 sm:px-4 sm:py-2.5 font-label-sm text-[11px] sm:text-label-sm",
            chain.payrollReady
              ? "border-[#2DD4BF]/30 bg-[#2DD4BF]/10 text-[#2DD4BF]"
              : "border-outline-variant/30 bg-surface-container-high/60 text-on-surface-variant",
          ].join(" ")}
        >
          <span className="material-symbols-outlined text-[14px] sm:text-[16px]">account_balance</span>
          <span className="flex-1 min-w-0 break-words">
            {freighterPublicKey
              ? `Stellar ${chain.network} — self-custody payroll`
              : chain.payrollReady
                ? `Stellar ${chain.network} — payroll on-chain`
                : `Stellar ${chain.network} — demo split`}
          </span>
          {freighterPublicKey ? (
            <span className="font-mono text-[10px] sm:text-xs opacity-80 shrink-0">
              {freighterPublicKey.slice(0, 4)}…{freighterPublicKey.slice(-4)}
            </span>
          ) : null}
          {chain.payrollContractId ? (
            <a
              href={`${chain.explorerContractBase}/${chain.payrollContractId}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[10px] sm:text-xs underline opacity-80 hover:opacity-100 shrink-0"
            >
              {chain.payrollContractId.slice(0, 6)}…
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        <p className="font-body-lg text-[15px] sm:text-body-lg text-on-surface-variant">
          Effortless regulatory compliance — prepared for your review.
        </p>
        <StatusBadge kind={routed ? "settled" : "active"}>
          {routed ? "Payroll Routed" : "Systems Synchronized"}
        </StatusBadge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-gutter md:grid-cols-12">
        <div className="md:col-span-8">
          <Card>
            <div className="mb-6 flex items-start justify-between">
              <h3 className="font-headline-md text-headline-md text-on-surface">BIR EIS Connect</h3>
              <span className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-[#2DD4BF]">
                LIVE
              </span>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              <StatBlock
                label="Pending Transmissions"
                value={String(eisStats.pending)}
                badge="T+3 Timeline Active"
                badgeAccent
              />
              <StatBlock
                label="JWS Secured Payloads"
                value={String(eisStats.total)}
                badge="Oracle submissions"
              />
              <div className="rounded-lg border border-outline-variant/10 bg-surface-container-low p-4">
                <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  System Status
                </div>
                <div className="mt-3.5 flex items-center gap-2">
                  <Icon name="check_circle" size={20} fill className="text-[#2DD4BF]" />
                  <span className="font-body-md text-body-md font-medium text-on-surface">
                    {eisStats.synchronized > 0
                      ? `${eisStats.synchronized} synchronized`
                      : "Awaiting ledger events"}
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-8 border-b border-outline-variant/20 py-2.5" aria-label="Expand" />
                    {["Payload ID", "Date", "BIR Ref ID", "Status"].map((h, i) => (
                      <th
                        key={h}
                        className={[
                          "border-b border-outline-variant/20 py-2.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant",
                          i === 3 ? "text-right" : "text-left",
                        ].join(" ")}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eisRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center font-body-md text-body-md text-on-surface-variant"
                      >
                        No EIS payloads yet — run Liquidity (mint/swap) or Route Payroll to
                        trigger the oracle.
                      </td>
                    </tr>
                  ) : (
                    eisRows.map((r, i, arr) => {
                      const expanded = expandedPayloadId === r.id;
                      const hasPayload = Boolean(r.payload);
                      return (
                        <Fragment key={r.id}>
                          <tr
                            className={[
                              i < arr.length - 1 && !expanded
                                ? "border-b border-outline-variant/10"
                                : "",
                              hasPayload ? "cursor-pointer hover:bg-surface-container-low/50" : "",
                            ].join(" ")}
                            onClick={() => {
                              if (!hasPayload) return;
                              setExpandedPayloadId(expanded ? null : r.id);
                            }}
                          >
                            <td className="py-3.5 pl-1">
                              {hasPayload ? (
                                <button
                                  type="button"
                                  aria-expanded={expanded}
                                  aria-label={
                                    expanded
                                      ? "Collapse BIR EIS payload"
                                      : "View BIR EIS payload (20 fields)"
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-high hover:text-[#2DD4BF]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedPayloadId(expanded ? null : r.id);
                                  }}
                                >
                                  <Icon
                                    name={expanded ? "expand_less" : "expand_more"}
                                    size={20}
                                  />
                                </button>
                              ) : null}
                            </td>
                            <td className="py-3.5 font-mono text-sm font-medium text-on-surface">
                              {r.payloadId ?? r.id}
                            </td>
                            <td className="py-3.5 font-body-md text-body-md text-on-surface-variant">
                              {r.date}
                            </td>
                            <td className="py-3.5 font-mono text-sm text-on-surface-variant">
                              {r.memoTxHash ? (
                                <a
                                  href={`${explorerTx}/${r.memoTxHash}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#2DD4BF] hover:underline"
                                  title="Memo write-back tx"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {r.ref}
                                </a>
                              ) : (
                                r.ref
                              )}
                            </td>
                            <td
                              className={[
                                "py-3.5 text-right font-body-md text-body-md font-medium",
                                r.status === "Synchronized"
                                  ? "text-[#2DD4BF]"
                                  : r.status === "Failed"
                                    ? "text-red-400"
                                    : r.status === "Awaiting review"
                                      ? "text-amber-300/90"
                                      : "text-on-surface-variant",
                              ].join(" ")}
                            >
                              {r.status}
                            </td>
                          </tr>
                          {expanded && r.payload ? (
                            <tr
                              key={`${r.id}-detail`}
                              className={
                                i < arr.length - 1 ? "border-b border-outline-variant/10" : ""
                              }
                            >
                              <td colSpan={5} className="pb-4 pt-1">
                                <EisPayloadPanel
                                  payload={r.payload}
                                  payloadId={r.payloadId ?? r.id}
                                  submissionId={r.id}
                                  pipelineStatus={r.pipelineStatus}
                                  eventKind={r.eventKind}
                                  stellarTxHash={r.stellarTxHash}
                                  memoTxHash={r.memoTxHash}
                                  memoText={r.memoText}
                                  jwsPreview={r.jwsPreview}
                                  explorerTxBase={explorerTx}
                                  onClose={() => setExpandedPayloadId(null)}
                                  onApproved={loadEis}
                                />
                                {r.error ? (
                                  <p className="mt-2 font-body-md text-body-md text-red-400/90">
                                    {r.error}
                                  </p>
                                ) : null}
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="md:col-span-4">
          <Card className="h-full">
            <h3 className="mb-6 font-headline-md text-headline-md text-on-surface">
              Filing Milestones
            </h3>
            <div className="relative flex flex-col gap-5">
              <div className="absolute top-3 bottom-3 left-[5px] w-px bg-outline-variant/40" />
              <Milestone
                date="Oct 25"
                title="VAT Remittance (2550Q)"
                sub="Auto-filed"
                status="active"
              />
              <Milestone
                date="Oct 30"
                title="Statutory Contributions"
                sub={routed ? "Routed on Stellar" : "Scheduled Bridging"}
                status={routed ? "active" : "upcoming"}
              />
              <Milestone
                date="Nov 05"
                title="Withholding Tax (1601-C)"
                sub="Pending Computation"
                status="upcoming"
              />
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Statutory Splitter</h3>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              {formatStatutoryLabel(getEffectiveStatutoryRates())}
              {lastSwapAdvancePhp
                ? " · Pool sized to your last swap advance (USDC on wallet)."
                : " · Run Tokenize & Swap on Liquidity first for an on-chain payroll budget."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-body-md text-body-md text-on-surface-variant">
              <Icon name="autorenew" size={16} />
              {quote ? "Quote ready" : "Loading quote…"}
            </span>
            {!routed ? (
              <Button
                variant="teal"
                size="sm"
                disabled={!walletReady || routing || !quote}
                onClick={() => setPendingPayrollConfirm(true)}
              >
                {routing ? "Routing…" : "Route Payroll"}
              </Button>
            ) : txHash ? (
              <a
                href={`${chain?.explorerTxBase ?? "https://stellar.expert/explorer/public/tx"}/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-label-md text-label-md text-[#2DD4BF] underline-offset-2 hover:underline"
              >
                <Icon name="receipt_long" size={16} />
                View TX
              </a>
            ) : null}
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-3 font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
            Payroll pipeline
          </p>
          <FlowPipeline steps={payrollPipelineSteps(payrollStage)} />
        </div>

        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_3fr]">
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-6 text-center">
            <div className="mb-3.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Gross Payroll Pool
            </div>
            <div className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
              ₱{formatAmount(gross)}
            </div>
            {quote ? (
              <div className="mt-2 font-label-sm text-label-sm text-on-surface-variant">
                Net to employees: ₱{formatAmount(netAmt)}
              </div>
            ) : null}
          </div>

          <Icon name="arrow_forward" size={24} className="hidden text-outline md:block" />

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <SplitTile
              icon="account_balance"
              name="SSS"
              amount={formatAmount(sssAmt)}
              pct={grossForPct > 0 ? sssAmt / grossForPct : 0}
            />
            <SplitTile
              icon="security"
              name="PhilHealth"
              amount={formatAmount(philAmt)}
              pct={grossForPct > 0 ? philAmt / grossForPct : 0}
            />
            <SplitTile
              icon="home"
              name="Pag-IBIG"
              amount={formatAmount(pagAmt)}
              pct={grossForPct > 0 ? pagAmt / grossForPct : 0}
            />
          </div>
        </div>
      </Card>

      {pendingPayrollConfirm && quote ? (
        <PayrollConfirmPanel
          draft={{
            gross: quote.gross,
            sss: quote.sss,
            philhealth: quote.philhealth,
            pagibig: quote.pagibig,
            net: quote.net,
          }}
          busy={routing}
          onCancel={() => setPendingPayrollConfirm(false)}
          onConfirm={() => {
            setPendingPayrollConfirm(false);
            void routePayroll();
          }}
        />
      ) : null}
    </main>
  );
}
