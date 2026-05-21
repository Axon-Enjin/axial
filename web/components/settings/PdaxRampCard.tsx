"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

const DEMO_RATE = 56.5;

export function PdaxRampCard() {
  const { dispatch } = useApp();
  const [phpAmount, setPhpAmount] = useState("100000");
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");

  const php = Number(phpAmount.replace(/,/g, "")) || 0;
  const usdc = php > 0 ? (php / DEMO_RATE).toFixed(2) : "0.00";

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Icon name="currency_exchange" size={22} className="text-[#2DD4BF]" />
            <h3 className="font-headline-md text-headline-md text-on-surface">PHP ↔ USDC Ramp</h3>
          </div>
          <p className="mt-1.5 font-body-md text-body-md text-on-surface-variant">
            SEP-24 interface — powered by{" "}
            <span className="text-on-surface">PDAX Connect</span> (demo UI, no live API).
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-2 py-1 font-label-sm text-label-sm text-[#2DD4BF]">
          L2 demo
        </span>
      </div>

      <div className="mb-4 flex gap-2">
        {(["deposit", "withdraw"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={[
              "rounded-lg px-4 py-2 font-label-md text-label-md capitalize transition-colors",
              mode === m
                ? "bg-primary text-on-primary"
                : "border border-outline-variant/30 text-on-surface-variant hover:text-on-surface",
            ].join(" ")}
          >
            {m} PHP
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Amount (PHP)
          </label>
          <input
            value={phpAmount}
            onChange={(e) => setPhpAmount(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-outline-variant/60 bg-surface-container px-3 py-2.5 font-mono text-sm text-on-surface outline-none focus:border-primary"
          />
        </div>
        <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-4">
          <div className="font-label-sm text-label-sm text-on-surface-variant">Indicative rate</div>
          <div className="mt-1 font-headline-md text-headline-md text-on-surface">
            ₱{DEMO_RATE.toFixed(2)} / USDC
          </div>
          <div className="mt-2 font-body-md text-body-md text-[#2DD4BF]">
            ≈ {usdc} USDC {mode === "deposit" ? "credited" : "sent"}
          </div>
        </div>
      </div>

      <p className="mt-4 font-body-md text-body-md text-on-surface-variant">
        Settlement on Stellar uses USDC. Invoices and payroll display PHP; conversion happens at
        swap time via oracle (demo rate above).
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={() =>
            dispatch(
              "transfer",
              `${mode === "deposit" ? "Deposit" : "Withdraw"} ₱${php.toLocaleString()} queued (PDAX demo)`,
            )
          }
        >
          {mode === "deposit" ? "Deposit PHP" : "Withdraw PHP"}
        </Button>
      </div>
    </Card>
  );
}
