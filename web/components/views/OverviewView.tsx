"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { Icon } from "@/components/ui/Icon";
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

const recentActions = [
  { icon: "receipt_long", title: "Invoice #402 tokenized", sub: "Supplier A · ₱150,000", time: "2m ago", accent: false },
  { icon: "cloud_done", title: "BIR Payload accepted", sub: "Automated Sync", time: "15m ago", accent: true },
  { icon: "account_balance", title: "Yield distributed", sub: "Treasury Vault A", time: "1h ago", accent: false },
  { icon: "security", title: "Smart Contract Audited", sub: "System Routine", time: "3h ago", accent: false },
];

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
    <div className="flex items-start gap-3.5 rounded-xl border border-outline-variant/10 bg-surface-container-low p-3.5">
      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2DD4BF]/30 bg-surface shadow-[0_0_15px_rgba(45,212,191,0.15)]">
        <Icon name={icon} size={20} className="text-[#2DD4BF]" />
      </div>
      <div>
        <h4 className="font-body-md text-body-md font-medium text-on-surface">{title}</h4>
        <p className="mt-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          {subtitle}
        </p>
        <p className="mt-2 flex items-center gap-1 font-label-sm text-label-sm text-[#2DD4BF]">
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

  const bars =
    range === "30D" ? bars30 : [...bars30, ...bars30.slice(0, 4).reverse()];
  const labels = range === "30D" ? labels30 : labels90;

  return (
    <main className="mx-auto max-w-container-max px-margin-mobile py-7 md:px-margin-desktop">
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
        <div className="md:col-span-8">
          <Card padding="lg">
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="mb-1.5 flex items-center gap-2 text-on-surface-variant">
                  <Icon name="account_balance" size={18} />
                  <span className="font-label-sm text-label-sm uppercase tracking-wider">
                    Available Liquidity
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-headline-xl text-headline-xl tracking-tight text-on-surface">
                    ₱24,500,000
                  </span>
                  <span className="font-body-lg text-body-lg text-on-surface-variant">.00</span>
                </div>
                <p className="mt-2 flex items-center gap-1 font-body-md text-body-md text-primary">
                  <Icon name="trending_up" size={16} />
                  +4.2% vs last 30 days
                </p>
              </div>
              <StatusBadge kind="active">Network Active</StatusBadge>
            </div>
            <div className="relative mt-12 flex gap-3.5">
              <Button variant="primary" size="lg" onClick={() => dispatch("unlock")}>
                Unlock Capital
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon="swap_horiz"
                onClick={() => dispatch("transfer")}
              >
                Transfer
              </Button>
            </div>
          </Card>
        </div>

        <div className="md:col-span-4">
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
                subtitle="T+3 Settlement Verified"
                status="Perfect Compliance"
              />
              <PulseRow
                icon="call_split"
                title="Statutory Splitting"
                subtitle="Automated VAT/WHT"
                status="12 Active Rules"
              />
            </div>
          </Card>
        </div>

        <div className="md:col-span-7">
          <Card className="flex min-h-[380px] flex-col">
            <CardHeader
              icon="monitoring"
              label="Operational Runway"
              action={
                <div className="flex gap-1.5">
                  {(["30D", "90D"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRange(r)}
                      className={[
                        "rounded-md px-3 py-1.5 font-label-sm text-label-sm tracking-wide transition-colors",
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
            <div className="relative flex flex-1 items-end justify-between gap-2 border-b border-outline-variant/20 px-2 pb-4">
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
            <div className="mt-3 flex justify-between px-2 font-label-sm text-label-sm tracking-wide text-outline">
              {labels.map((d) => (
                <span key={d}>{d}</span>
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
                <button
                  type="button"
                  className="bg-transparent font-label-sm text-label-sm text-primary hover:underline"
                >
                  View All
                </button>
              }
            />
            <div className="flex flex-col">
              {recentActions.map((row, i, arr) => (
                <div
                  key={row.title}
                  className={[
                    "flex items-center justify-between py-3.5",
                    i < arr.length - 1 ? "border-b border-outline-variant/15" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-md border border-outline-variant/20 bg-surface",
                        row.accent ? "text-[#2DD4BF]" : "text-on-surface-variant",
                      ].join(" ")}
                    >
                      <Icon name={row.icon} size={16} />
                    </div>
                    <div>
                      <div className="font-body-md text-body-md text-on-surface">{row.title}</div>
                      <div className="mt-0.5 font-label-sm text-label-sm text-on-surface-variant">
                        {row.sub}
                      </div>
                    </div>
                  </div>
                  <span className="font-label-sm text-label-sm tracking-wide text-outline">
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
