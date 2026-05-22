"use client";

import { useState, useEffect } from "react";
import { OrgCard } from "@/components/settings/OrgCard";
import { PdaxRampCard } from "@/components/settings/PdaxRampCard";
import { WalletCard } from "@/components/settings/WalletCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

type Creds = {
  tin: string;
  sss: string;
  ph: string;
  hdmf: string;
};

type AutoSettings = {
  factoring: boolean;
  statutory: boolean;
};

type AuditRow = { time: string; actor: string; event: string };

function eisToAuditRow(s: {
  date: string;
  eventKind: string;
  pipelineStatus: string;
  referenceId: string;
  birReferenceId: string | null;
}): AuditRow {
  const kindLabel: Record<string, string> = {
    receivable_minted: "Receivable SAC minted",
    swap_executed: "Atomic swap executed",
    payroll_routed: "Statutory split routed",
  };
  const statusLabel: Record<string, string> = {
    memo_written: "memo written to Stellar",
    acknowledged: "BIR acknowledged",
    submitted: "submitted to BIR",
    queued: "queued",
    failed: "pipeline failed",
  };
  const kind = kindLabel[s.eventKind] ?? "EIS event";
  const status = statusLabel[s.pipelineStatus] ?? s.pipelineStatus;
  const bir = s.birReferenceId ? ` · BIR ref: ${s.birReferenceId}` : "";
  return {
    time: s.date,
    actor: "system",
    event: `${kind} — ${s.referenceId} · ${status}${bir}.`,
  };
}

function Field({
  label,
  value,
  onChange,
  mono,
  after,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  after?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
        {label}
      </label>
      <div className="flex items-center gap-2.5">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "flex-1 rounded-lg border border-outline-variant/60 bg-surface-container px-3 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_2px_rgba(190,198,224,0.15)]",
            mono ? "font-mono" : "font-body-md",
          ].join(" ")}
        />
        {after}
      </div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={[
        "relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors",
        on ? "bg-primary" : "border border-outline-variant/20 bg-surface-variant",
      ].join(" ")}
    >
      <span
        className={[
          "block h-[18px] w-[18px] rounded-full transition-transform",
          on ? "translate-x-5 bg-on-primary" : "translate-x-0 bg-outline",
        ].join(" ")}
      />
    </button>
  );
}

function AutomationCard({
  title,
  body,
  on,
  onChange,
}: {
  title: string;
  body: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-5">
      <div>
        <div className="font-body-lg text-body-lg font-medium text-on-surface">{title}</div>
        <p className="mt-1.5 max-w-sm font-body-md text-body-md text-on-surface-variant">{body}</p>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

export function SettingsView() {
  const [creds, setCreds] = useState<Creds>({
    tin: "000-123-456-000",
    sss: "03-9876543-2",
    ph: "14-000000000-1",
    hdmf: "2000-1234-5678",
  });
  const [auto, setAuto] = useState<AutoSettings>({
    factoring: true,
    statutory: false,
  });
  const [auditLogs, setAuditLogs] = useState<AuditRow[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);

  useEffect(() => {
    fetch("/api/eis/submissions")
      .then((r) => r.json())
      .then((data) => {
        setAuditLogs((data.submissions ?? []).map(eisToAuditRow));
      })
      .catch(() => {})
      .finally(() => setAuditLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-container-max space-y-gutter px-margin-mobile py-7 md:px-margin-desktop">
      <p className="font-body-lg text-body-lg text-on-surface-variant">
        Configure autonomous systems, regulatory credentials, and API bridges.
      </p>

      <OrgCard />

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
        <div className="md:col-span-8">
          <Card>
            <div className="mb-1.5 flex items-center gap-2.5">
              <Icon name="account_balance" size={22} />
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Government Agency Credentials
              </h3>
            </div>
            <p className="mb-5 font-body-md text-body-md text-on-surface-variant">
              Manage corporate identity and regulatory compliance IDs required for automated
              statutory parsing.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field
                  label="BIR Tax Identification Number (TIN)"
                  value={creds.tin}
                  onChange={(v) => setCreds({ ...creds, tin: v })}
                  mono
                />
              </div>
              <div className="md:col-span-2">
                <Field
                  label="SSS Employer ID"
                  value={creds.sss}
                  onChange={(v) => setCreds({ ...creds, sss: v })}
                  mono
                />
              </div>
              <Field
                label="PhilHealth No."
                value={creds.ph}
                onChange={(v) => setCreds({ ...creds, ph: v })}
                mono
              />
              <Field
                label="HDMF (Pag-IBIG)"
                value={creds.hdmf}
                onChange={(v) => setCreds({ ...creds, hdmf: v })}
                mono
              />
            </div>

            <div className="mt-5 flex justify-end">
              <Button variant="primary">Save Credentials</Button>
            </div>
          </Card>
        </div>

        <div className="md:col-span-4">
          <WalletCard />
        </div>
      </div>

      <PdaxRampCard />

      <div>
        <h3 className="mb-4 font-headline-md text-headline-md text-on-surface">Automation Logic</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AutomationCard
            title="Auto-Factoring"
            body="Automatically evaluate and route approved invoices to the designated liquidity pool without manual intervention."
            on={auto.factoring}
            onChange={(v) => setAuto({ ...auto, factoring: v })}
          />
          <AutomationCard
            title="Auto-Split Statutory"
            body="Systematically deduct and route government agency liabilities (BIR, SSS) to reserve wallets prior to payroll disbursement."
            on={auto.statutory}
            onChange={(v) => setAuto({ ...auto, statutory: v })}
          />
        </div>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-headline-md text-headline-md text-on-surface">System Audit Logs</h3>
          <Button variant="ghost" iconRight="file_download" className="text-primary">
            Export CSV
          </Button>
        </div>
        <div className="flex flex-col">
          {auditLoading ? (
            <p className="py-6 text-center font-body-md text-body-md text-on-surface-variant">
              Loading…
            </p>
          ) : auditLogs.length === 0 ? (
            <p className="py-6 text-center font-body-md text-body-md text-on-surface-variant">
              No EIS events yet. Execute a swap or route payroll to populate this log.
            </p>
          ) : (
            auditLogs.map((r, i, arr) => (
              <div
                key={`${r.time}-${i}`}
                className={[
                  "grid grid-cols-1 items-baseline gap-2 py-3 md:grid-cols-[180px_60px_1fr] md:gap-4",
                  i < arr.length - 1 ? "border-b border-outline-variant/15" : "",
                ].join(" ")}
              >
                <span className="font-mono text-sm text-on-surface-variant">{r.time}</span>
                <span
                  className={[
                    "font-label-sm text-label-sm uppercase tracking-wider",
                    r.actor === "system" ? "text-[#2DD4BF]" : "text-primary",
                  ].join(" ")}
                >
                  {r.actor}
                </span>
                <span className="font-body-md text-body-md text-on-surface">{r.event}</span>
              </div>
            ))
          )}
        </div>
      </Card>
    </main>
  );
}
