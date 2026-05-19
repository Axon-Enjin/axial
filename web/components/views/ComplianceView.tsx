"use client";

import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
        <div className="h-full bg-[#2DD4BF]" style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
}

const payloads = [
  { id: "PLD-8829-A", date: "Oct 24, 14:30", ref: "BIR-2026-991A", status: "Synchronized" as const },
  { id: "PLD-8830-B", date: "Oct 24, 15:45", ref: "Pending…", status: "Bridging" as const },
  { id: "PLD-8831-C", date: "Oct 24, 16:10", ref: "Pending…", status: "Bridging" as const },
];

export function ComplianceView() {
  return (
    <main className="compliance-route mx-auto max-w-container-max space-y-gutter px-margin-mobile py-7 md:px-margin-desktop">
      <div className="flex items-start justify-between gap-4">
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Invisible background regulatory processes.
        </p>
        <StatusBadge kind="active">Systems Synchronized</StatusBadge>
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
                value="14"
                badge="T+3 Timeline Active"
                badgeAccent
              />
              <StatBlock label="JWS Secured Payloads" value="8,241" badge="Last 30 Days" />
              <div className="rounded-lg border border-outline-variant/10 bg-surface-container-low p-4">
                <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  System Status
                </div>
                <div className="mt-3.5 flex items-center gap-2">
                  <Icon name="check_circle" size={20} fill className="text-[#2DD4BF]" />
                  <span className="font-body-md text-body-md font-medium text-on-surface">
                    Synchronized
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
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
                  {payloads.map((r, i, arr) => (
                    <tr
                      key={r.id}
                      className={i < arr.length - 1 ? "border-b border-outline-variant/10" : ""}
                    >
                      <td className="py-3.5 font-mono text-sm font-medium text-on-surface">{r.id}</td>
                      <td className="py-3.5 font-body-md text-body-md text-on-surface-variant">
                        {r.date}
                      </td>
                      <td className="py-3.5 font-mono text-sm text-on-surface-variant">{r.ref}</td>
                      <td
                        className={[
                          "py-3.5 text-right font-body-md text-body-md font-medium",
                          r.status === "Synchronized" ? "text-[#2DD4BF]" : "text-on-surface-variant",
                        ].join(" ")}
                      >
                        {r.status}
                      </td>
                    </tr>
                  ))}
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
                sub="Scheduled Bridging"
                status="upcoming"
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
        <div className="mb-6 flex items-start justify-between">
          <h3 className="font-headline-md text-headline-md text-on-surface">Statutory Splitter</h3>
          <span className="inline-flex items-center gap-1.5 font-body-md text-body-md text-on-surface-variant">
            <Icon name="autorenew" size={16} />
            Auto-slicing Active
          </span>
        </div>

        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_3fr]">
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-6 text-center">
            <div className="mb-3.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Gross Payroll Pool
            </div>
            <div className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
              ₱1,250,000
              <span className="font-body-md text-body-md text-on-surface-variant">.00</span>
            </div>
          </div>

          <Icon name="arrow_forward" size={24} className="hidden text-outline md:block" />

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <SplitTile icon="account_balance" name="SSS Wallet" amount="142,500.00" pct={0.65} />
            <SplitTile icon="security" name="PhilHealth" amount="56,250.00" pct={0.35} />
            <SplitTile icon="home" name="Pag-IBIG" amount="25,000.00" pct={0.2} />
          </div>
        </div>
      </Card>
    </main>
  );
}
