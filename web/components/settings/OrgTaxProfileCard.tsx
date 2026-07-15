"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

type TaxForm = {
  sellerTin: string;
  sellerName: string;
  sellerAddress: string;
  buyerTinDefault: string;
  buyerNameDefault: string;
  buyerAddressDefault: string;
};

const EMPTY: TaxForm = {
  sellerTin: "",
  sellerName: "",
  sellerAddress: "",
  buyerTinDefault: "",
  buyerNameDefault: "",
  buyerAddressDefault: "",
};

export function OrgTaxProfileCard() {
  const [form, setForm] = useState<TaxForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void fetch("/api/org/settings")
      .then((r) => r.json())
      .then((d: Partial<TaxForm>) =>
        setForm({
          sellerTin: d.sellerTin ?? "",
          sellerName: d.sellerName ?? "",
          sellerAddress: d.sellerAddress ?? "",
          buyerTinDefault: d.buyerTinDefault ?? "",
          buyerNameDefault: d.buyerNameDefault ?? "",
          buyerAddressDefault: d.buyerAddressDefault ?? "",
        }),
      )
      .catch(() => null);
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/org/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof TaxForm, label: string) => (
    <div className="flex flex-col gap-1.5">
      <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
        {label}
      </label>
      <input
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="rounded-lg border border-outline-variant/60 bg-surface-container px-3 py-2.5 font-body-md text-sm text-on-surface outline-none focus:border-primary"
      />
    </div>
  );

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Icon name="receipt_long" size={22} className="text-primary" />
        <h3 className="font-headline-md text-headline-md text-on-surface">EIS tax profile</h3>
      </div>
      <p className="mb-4 font-body-md text-body-md text-on-surface-variant">
        Per-org seller and default buyer fields for BIR EIS payloads. Falls back to env defaults when
        blank.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {field("sellerTin", "Seller TIN")}
        {field("sellerName", "Seller name")}
        {field("sellerAddress", "Seller address")}
        {field("buyerTinDefault", "Default buyer TIN")}
        {field("buyerNameDefault", "Default buyer name")}
        {field("buyerAddressDefault", "Default buyer address")}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button variant="primary" disabled={saving} onClick={() => void save()}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
        {saved ? (
          <span className="font-label-sm text-label-sm text-[#2DD4BF]">Saved</span>
        ) : null}
      </div>
    </Card>
  );
}
