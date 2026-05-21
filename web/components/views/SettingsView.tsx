"use client";

import { useState } from "react";
import { PdaxRampCard } from "@/components/settings/PdaxRampCard";
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

const auditLogs = [
  {
    time: "2026-10-24 16:10",
    actor: "system",
    event: "EIS payload PLD-8831-C signed (JWS) and queued for T+3 bridge.",
  },
  {
    time: "2026-10-24 14:30",
    actor: "system",
    event: "BIR EIS PLD-8829-A acknowledged. Ref: BIR-2026-991A.",
  },
  {
    time: "2026-10-24 11:02",
    actor: "AM",
    event: "Atomic swap executed on INV-2023-8901. 118,500 USDC settled.",
  },
  {
    time: "2026-10-23 17:44",
    actor: "system",
    event: "Statutory split routed. SSS 142,500 · PhilHealth 56,250 · Pag-IBIG 25,000.",
  },
];

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
  const [lenderLimit, setLenderLimit] = useState("250000");

  return (
    <main className="mx-auto max-w-container-max space-y-gutter px-margin-mobile py-7 md:px-margin-desktop">
      <p className="font-body-lg text-body-lg text-on-surface-variant">
        Configure autonomous systems, regulatory credentials, and API bridges.
      </p>

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
          <Card className="h-full">
            <div className="mb-5 flex items-center gap-2.5">
              <Icon name="account_balance_wallet" size={22} />
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Stellar Wallet & Liquidity
              </h3>
            </div>

            <div className="mb-4 rounded-lg border border-outline-variant/30 bg-surface-container-low p-3.5">
              <div className="mb-1.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Primary Treasury Public Key
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-medium text-on-surface">GC02…X9L4M</span>
                <Icon name="content_copy" size={16} className="text-on-surface-variant" />
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Default Liquidity Pool
                </label>
                <div className="flex cursor-pointer items-center justify-between rounded-lg border border-outline-variant/60 bg-surface-container px-3 py-2.5 font-body-md text-body-md text-on-surface">
                  Axial Prime Treasury (USDC)
                  <Icon name="keyboard_arrow_down" size={18} className="text-on-surface-variant" />
                </div>
              </div>

              <Field
                label="Lender Preference Limit"
                value={lenderLimit}
                onChange={setLenderLimit}
                mono
                after={
                  <span className="font-label-md text-label-md text-on-surface-variant">USDC</span>
                }
              />
            </div>
          </Card>
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
          {auditLogs.map((r, i, arr) => (
            <div
              key={r.time}
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
          ))}
        </div>
      </Card>
    </main>
  );
}
