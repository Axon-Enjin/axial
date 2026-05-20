"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { EisPayloadPanel } from "@/components/compliance/EisPayloadPanel";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { BirEisPayload } from "@/lib/eis/types";

const DEFAULT_GROSS = 1_250_000;

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
  date: string;
  ref: string;
  status: "Synchronized" | "Bridging" | "Failed";
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
  explorerTxBase: string;
};

export function ComplianceView() {
  const { dispatch } = useApp();
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

  const gross = DEFAULT_GROSS;
  const explorerTx =
    chain?.explorerTxBase ?? "https://stellar.expert/explorer/testnet/tx";

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
    setRouting(true);
    const payrollId = `PAY-${Date.now()}`;
    try {
      const res = await fetch("/api/payroll/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payrollId, grossAmount: gross }),
      });
      const data = (await res.json()) as {
        mode?: string;
        txHash?: string;
        error?: string;
        sss?: number;
        philhealth?: number;
        pagibig?: number;
        net?: number;
      };

      if (!res.ok) {
        dispatch("payroll-routed", data.error ?? `Payroll failed (${res.status})`);
        return;
      }

      if (data.sss != null) {
        setQuote({
          gross,
          sss: data.sss,
          philhealth: data.philhealth ?? 0,
          pagibig: data.pagibig ?? 0,
          net: data.net ?? 0,
        });
      }

      setRouted(true);
      if (data.mode === "on-chain" && data.txHash) {
        setTxHash(data.txHash);
        dispatch("payroll-routed", `tx:${payrollId}|${data.txHash}`);
      } else {
        dispatch("payroll-routed", payrollId);
      }
      window.setTimeout(loadEis, 4000);
    } finally {
      setRouting(false);
    }
  }, [dispatch, gross, loadEis]);

  const sssAmt = quote?.sss ?? 0;
  const philAmt = quote?.philhealth ?? 0;
  const pagAmt = quote?.pagibig ?? 0;
  const netAmt = quote?.net ?? 0;
  const grossForPct = quote?.gross ?? gross;

  return (
    <main className="compliance-route mx-auto max-w-container-max space-y-gutter px-margin-mobile py-7 md:px-margin-desktop">
      {chain ? (
        <div
          className={[
            "flex flex-wrap items-center gap-2 rounded-xl border px-4 py-2.5 font-label-sm text-label-sm",
            chain.payrollReady
              ? "border-[#2DD4BF]/30 bg-[#2DD4BF]/10 text-[#2DD4BF]"
              : "border-outline-variant/30 bg-surface-container-high/60 text-on-surface-variant",
          ].join(" ")}
        >
          <span className="material-symbols-outlined text-[16px]">account_balance</span>
          <span>
            {chain.payrollReady
              ? `Stellar ${chain.network} — statutory payroll routing on-chain`
              : `Stellar ${chain.network} — demo split (deploy payroll_split + STELLAR_MSME_SECRET)`}
          </span>
          {chain.payrollContractId ? (
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${chain.payrollContractId}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto font-mono text-xs underline opacity-80 hover:opacity-100"
            >
              {chain.payrollContractId.slice(0, 8)}…
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Invisible background regulatory processes.
        </p>
        <StatusBadge kind={routed ? "settled" : "active"}>
          {routed ? "Payroll Routed" : "Systems Synchronized"}
        </StatusBadge>
      </div>

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
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
                              {r.id}
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
                                  payloadId={r.id}
                                  eventKind={r.eventKind}
                                  stellarTxHash={r.stellarTxHash}
                                  memoTxHash={r.memoTxHash}
                                  memoText={r.memoText}
                                  jwsPreview={r.jwsPreview}
                                  explorerTxBase={explorerTx}
                                  onClose={() => setExpandedPayloadId(null)}
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
              Demo rates: SSS 11% · PhilHealth 5% · Pag-IBIG 2% · Net 82%
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
                disabled={routing || !quote}
                onClick={() => void routePayroll()}
              >
                {routing ? "Routing…" : "Route Payroll"}
              </Button>
            ) : txHash ? (
              <a
                href={`${chain?.explorerTxBase ?? "https://stellar.expert/explorer/testnet/tx"}/${txHash}`}
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
    </main>
  );
}
