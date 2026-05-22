"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { Icon } from "@/components/ui/Icon";
import { TestnetTreasuryCard } from "@/components/overview/TestnetTreasuryCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

type BarSpec = { h: number; active?: boolean };

const bars30: BarSpec[] = [
  { h: 30 },
  { h: 48 },
  { h: 28 },
  { h: 62, active: true },
  { h: 52 },
  { h: 82 },
  { h: 68 },
];

const labels30 = ["Oct 01", "Oct 05", "Oct 10", "Oct 15", "Oct 20", "Oct 25", "Oct 30"];
const labels90 = [
  "Aug",
  "Sep 10",
  "Sep 20",
  "Sep 30",
  "Oct 10",
  "Oct 20",
  "Oct 30",
  "Nov",
  "Nov 10",
  "Nov 20",
  "Nov 30",
];

type ChainStatus = {
  network: string;
  onChainReady?: boolean;
  payrollReady?: boolean;
  eisStore?: string;
};

type DashboardSummary = {
  book?: {
    totalInvoices: number;
    totalFacePhp: number;
    fundableCount: number;
    settledCount: number;
  };
  treasury?: { funderUsdc: string | null; msmeUsdc: string | null };
  eis?: { total: number; synchronized: number };
  contractsDeployed?: number;
};

type EisStats = {
  pending: number;
  synchronized: number;
  total: number;
};

type EisSubmissionRow = {
  id: string;
  date: string;
  ref: string;
  status: string;
  eventKind?: string;
  referenceId?: string;
};

type RecentAction = {
  icon: string;
  title: string;
  sub: string;
  time: string;
  accent: boolean;
};

function eventToAction(row: EisSubmissionRow): RecentAction {
  const ref = row.referenceId ?? row.id;
  switch (row.eventKind) {
    case "receivable_minted":
      return {
        icon: "receipt_long",
        title: `${ref} tokenized`,
        sub: row.status === "Synchronized" ? `BIR ${row.ref}` : "EIS bridging",
        time: row.date,
        accent: row.status === "Synchronized",
      };
    case "swap_executed":
      return {
        icon: "swap_horiz",
        title: "USDC advance executed",
        sub: ref,
        time: row.date,
        accent: row.status === "Synchronized",
      };
    case "payroll_routed":
      return {
        icon: "call_split",
        title: "Payroll routed on Stellar",
        sub: row.status === "Synchronized" ? `BIR ${row.ref}` : "Statutory split",
        time: row.date,
        accent: row.status === "Synchronized",
      };
    default:
      return {
        icon: "cloud_done",
        title: "EIS payload queued",
        sub: row.id,
        time: row.date,
        accent: false,
      };
  }
}

function birPulseCopy(stats: EisStats, store?: string): { subtitle: string; status: string } {
  if (stats.total === 0) {
    return {
      subtitle: "Oracle ready · no submissions yet",
      status: "Run Liquidity or Compliance to sync",
    };
  }
  if (stats.pending > 0) {
    return {
      subtitle: `T+3 window active · ${stats.pending} bridging`,
      status: `${stats.synchronized} synchronized · ${store ?? "store"}`,
    };
  }
  return {
    subtitle: `${stats.synchronized} payload${stats.synchronized === 1 ? "" : "s"} synchronized`,
    status: "BIR EIS accepted · memo on Stellar",
  };
}

function PulseRow({
  icon,
  title,
  subtitle,
  status,
}: {
  icon: string;
  title: string;
  subtitle: string;
  status: string;
}) {
  return (
    <div className="flex items-start gap-2.5 sm:gap-3.5 rounded-lg sm:rounded-xl border border-outline-variant/10 bg-surface-container-low p-3 sm:p-3.5">
      <div className="mt-0.5 sm:mt-1 flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-[#2DD4BF]/30 bg-surface shadow-[0_0_15px_rgba(45,212,191,0.15)]">
        <Icon name={icon} size={20} className="text-[#2DD4BF]" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-body-md text-[13px] sm:text-body-md font-medium text-on-surface">{title}</h4>
        <p className="mt-1 font-label-sm text-[10px] sm:text-label-sm uppercase tracking-wider text-on-surface-variant">
          {subtitle}
        </p>
        <p className="mt-1.5 sm:mt-2 flex items-center gap-1 font-label-sm text-[10px] sm:text-label-sm text-[#2DD4BF]">
          <Icon name="check_circle" size={14} />
          {status}
        </p>
      </div>
    </div>
  );
}

export function OverviewView() {
  const { dispatch } = useApp();
  const [range, setRange] = useState<"30D" | "90D">("30D");
  const [chain, setChain] = useState<ChainStatus | null>(null);
  const [eisStats, setEisStats] = useState<EisStats>({
    pending: 0,
    synchronized: 0,
    total: 0,
  });
  const [eisStore, setEisStore] = useState<string>("file");
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const loadLiveStatus = useCallback(() => {
    fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then((d) => setSummary(d as DashboardSummary))
      .catch(() => setSummary(null));

    fetch("/api/soroban/status")
      .then((r) => r.json())
      .then((d) => setChain(d as ChainStatus))
      .catch(() => setChain(null));

    fetch("/api/eis/submissions")
      .then((r) => r.json())
      .then((d) => {
        if (d.stats) setEisStats(d.stats as EisStats);
        if (d.store) setEisStore(d.store as string);
        const rows = Array.isArray(d.submissions) ? (d.submissions as EisSubmissionRow[]) : [];
        setRecentActions(rows.slice(0, 4).map(eventToAction));
      })
      .catch(() => {
        setEisStats({ pending: 0, synchronized: 0, total: 0 });
        setRecentActions([]);
      });
  }, []);

  useEffect(() => {
    loadLiveStatus();
    const id = window.setInterval(loadLiveStatus, 30_000);
    return () => window.clearInterval(id);
  }, [loadLiveStatus]);

  const birPulse = birPulseCopy(eisStats, eisStore);
  const networkLabel = chain?.network
    ? `Stellar ${chain.network}${chain.onChainReady ? "" : " · setup"}`
    : "Network Active";

  const eisActivity = Math.min(100, 28 + (eisStats.synchronized + 1) * 12);
  const bars =
    range === "30D"
      ? bars30.map((b, i) => ({
          ...b,
          h: i === 3 ? eisActivity : b.h,
          active: i === 3,
        }))
      : [...bars30, ...bars30.slice(0, 4).reverse()].map((b, i) => ({
          ...b,
          h: Math.min(100, b.h + eisStats.synchronized * 2),
          active: i === 6,
        }));
  const labels = range === "30D" ? labels30 : labels90;

  const faceDisplay = summary?.book?.totalFacePhp
    ? summary.book.totalFacePhp.toLocaleString()
    : "—";
  const bookSub = summary?.book
    ? `${summary.book.totalInvoices} invoices · ${summary.book.fundableCount} fundable · ${summary.book.settledCount} funded`
    : "Loading book from API…";

  return (
    <main className="mx-auto max-w-container-max px-4 py-5 sm:px-6 sm:py-6 md:px-margin-desktop md:py-7">
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-gutter md:grid-cols-12">
        <div className="md:col-span-8">
          <Card padding="lg" className="flex flex-col h-full">
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
            <div className="relative flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0 flex-1">
              <div className="flex-1 flex flex-col justify-between min-h-full">
                <div>
                  <div className="mb-1.5 flex items-center gap-2 text-on-surface-variant">
                    <Icon name="account_balance" size={18} />
                    <span className="font-label-sm text-[11px] sm:text-label-sm uppercase tracking-wider">
                      Available Liquidity
                    </span>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-baseline gap-1">
                    <span className="font-headline-xl text-[28px] sm:text-[36px] md:text-headline-xl tracking-tight text-on-surface">
                      ₱{faceDisplay}
                    </span>
                    <span className="font-body-lg text-[16px] sm:text-body-lg text-on-surface-variant">.00</span>
                  </div>
                  <p className="mt-2 font-body-md text-[13px] sm:text-body-md text-on-surface-variant">
                    {bookSub}
                  </p>
                  {summary?.treasury?.funderUsdc ? (
                    <p className="mt-1 font-label-sm text-[11px] sm:text-label-sm text-[#2DD4BF]">
                      Treasury USDC {summary.treasury.funderUsdc} · testnet
                    </p>
                  ) : null}
                </div>
                <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-3.5">
                  <Link href="/app/liquidity" className="flex-1 sm:flex-initial">
                    <Button variant="primary" size="lg" onClick={() => dispatch("unlock")} className="w-full sm:w-auto">
                      Unlock Capital
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="lg"
                    icon="swap_horiz"
                    onClick={() => dispatch("transfer")}
                    className="w-full sm:w-auto"
                  >
                    Transfer
                  </Button>
                </div>
              </div>
              <StatusBadge kind={chain?.onChainReady ? "active" : "scanning"}>
                {networkLabel}
              </StatusBadge>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4 sm:gap-5 md:gap-gutter md:col-span-4">
          <TestnetTreasuryCard />
          <Card className="h-full">
            <CardHeader
              icon="policy"
              label="Regulatory Pulse"
              action={<Icon name="more_horiz" size={20} className="text-outline-variant" />}
            />
            <div className="flex flex-col gap-4">
              <PulseRow
                icon="cloud_done"
                title="BIR EIS Sync"
                subtitle={birPulse.subtitle}
                status={birPulse.status}
              />
              <PulseRow
                icon="call_split"
                title="Statutory Splitting"
                subtitle={
                  chain?.payrollReady
                    ? "SSS · PhilHealth · Pag-IBIG on-chain"
                    : "Demo split — deploy payroll_split"
                }
                status={
                  chain?.payrollReady ? "Payroll router live" : "Preview in Compliance"
                }
              />
            </div>
          </Card>
        </div>

        <div className="md:col-span-7">
          <Card className="flex min-h-[320px] sm:min-h-[380px] flex-col">
            <CardHeader
              icon="monitoring"
              label="EIS activity"
              action={
                <div className="flex gap-1 sm:gap-1.5">
                  {(["30D", "90D"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRange(r)}
                      className={[
                        "rounded-md px-2 py-1 sm:px-3 sm:py-1.5 font-label-sm text-[11px] sm:text-label-sm tracking-wide transition-colors",
                        range === r
                          ? "border border-outline-variant/40 bg-surface-container-high text-on-surface"
                          : "border border-transparent text-on-surface-variant hover:text-on-surface",
                      ].join(" ")}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              }
            />
            <div className="relative flex flex-1 items-end justify-between gap-1 sm:gap-2 border-b border-outline-variant/20 px-1 sm:px-2 pb-4">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="border-t border-outline-variant/10" />
                ))}
              </div>
              {bars.map((b, i) => (
                <div
                  key={i}
                  className={[
                    "relative max-w-[60px] flex-1 rounded-t-sm",
                    b.active
                      ? "border border-b-0 border-primary/20 bg-primary/20 shadow-[0_-5px_15px_rgba(190,198,224,0.05)]"
                      : i % 3 === 0
                        ? "bg-surface-variant/40"
                        : i % 3 === 1
                          ? "bg-surface-variant/30"
                          : "bg-surface-variant/20",
                  ].join(" ")}
                  style={{ height: `${b.h}%` }}
                >
                  <div
                    className={[
                      "absolute top-0 right-0 left-0 h-0.5",
                      b.active ? "bg-primary" : "bg-primary/30",
                    ].join(" ")}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between px-1 sm:px-2 font-label-sm text-[9px] sm:text-label-sm tracking-wide text-outline">
              {labels.map((d) => (
                <span key={d} className="text-center">{d}</span>
              ))}
            </div>
          </Card>
        </div>

        <div className="md:col-span-5">
          <Card className="h-full">
            <CardHeader
              icon="history"
              label="Recent Actions"
              action={
                <Link
                  href="/app/compliance"
                  className="bg-transparent font-label-sm text-[11px] sm:text-label-sm text-primary hover:underline"
                >
                  View All
                </Link>
              }
            />
            <div className="flex flex-col">
              {recentActions.length === 0 ? (
                <p className="py-6 text-center font-body-md text-[13px] sm:text-body-md text-on-surface-variant px-4">
                  No ledger events yet — tokenize a receivable or route payroll to populate
                  this feed.
                </p>
              ) : null}
              {recentActions.map((row, i, arr) => (
                <div
                  key={row.title}
                  className={[
                    "flex items-center justify-between py-3 sm:py-3.5",
                    i < arr.length - 1 ? "border-b border-outline-variant/15" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div
                      className={[
                        "flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md border border-outline-variant/20 bg-surface",
                        row.accent ? "text-[#2DD4BF]" : "text-on-surface-variant",
                      ].join(" ")}
                    >
                      <Icon name={row.icon} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-body-md text-[13px] sm:text-body-md text-on-surface truncate">{row.title}</div>
                      <div className="mt-0.5 font-label-sm text-[10px] sm:text-label-sm text-on-surface-variant truncate">
                        {row.sub}
                      </div>
                    </div>
                  </div>
                  <span className="font-label-sm text-[10px] sm:text-label-sm tracking-wide text-outline ml-2 shrink-0">
                    {row.time}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
