"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Payer } from "@/lib/payers/types";

type Props = {
  /** Called when a new payer is registered so the invoices list can refresh. */
  onPayerRegistered?: (payer: Payer) => void;
};

type FormState = {
  legalName: string;
  tin: string;
  contactEmail: string;
};

const EMPTY_FORM: FormState = { legalName: "", tin: "", contactEmail: "" };

function KybBadge({ status }: { status: Payer["kybStatus"] }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-2 py-0.5 font-label-sm text-label-sm text-[#2DD4BF]">
        <Icon name="verified" size={12} />
        Verified
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-label-sm text-label-sm text-red-400">
        <Icon name="cancel" size={12} />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant/30 bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
      <Icon name="pending" size={12} />
      KYB pending
    </span>
  );
}

/** Collapsible payer registry panel — sits above the Active Factoring table. */
export function PayerPanel({ onPayerRegistered }: Props) {
  const [open, setOpen] = useState(false);
  const [payers, setPayers] = useState<Payer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  const loadPayers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payers");
      const data = (await res.json()) as { payers?: Payer[] };
      setPayers(data.payers ?? []);
      loadedRef.current = true;
    } catch {
      // silently fail — payer registry is additive, not blocking
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && !loadedRef.current) {
      void loadPayers();
    }
  }, [open, loadPayers]);

  const handleSubmit = async () => {
    setFormError(null);
    const { legalName, tin, contactEmail } = form;
    if (!legalName.trim()) { setFormError("Legal name is required"); return; }
    if (!tin.trim()) { setFormError("TIN is required"); return; }
    if (!contactEmail.trim()) { setFormError("Contact email is required"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/payers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legalName: legalName.trim(), tin: tin.trim(), contactEmail: contactEmail.trim() }),
      });
      const data = (await res.json()) as { payer?: Payer; error?: string };
      if (!res.ok || !data.payer) {
        setFormError(data.error ?? "Failed to register payer");
        return;
      }
      setPayers((prev) => [data.payer!, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      onPayerRegistered?.(data.payer);
    } catch {
      setFormError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const reviewKyb = async (payerId: string, status: "verified" | "rejected") => {
    try {
      const res = await fetch(`/api/payers/${encodeURIComponent(payerId)}/kyb`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as { payer?: Payer };
      if (data.payer) {
        setPayers((prev) => prev.map((p) => (p.id === payerId ? data.payer! : p)));
      }
    } catch {
      // silent
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container/40">
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-surface-variant/10"
      >
        <div className="flex items-center gap-3">
          <Icon name="badge" size={18} className="text-on-surface-variant" />
          <span className="font-label-md text-label-md font-semibold text-on-surface">
            Payer Registry
          </span>
          {payers.length > 0 && (
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
              {payers.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!open && payers.length === 0 && (
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Register enterprise payers for confirmed-invoice funding
            </span>
          )}
          <Icon
            name={open ? "expand_less" : "expand_more"}
            size={20}
            className="text-on-surface-variant"
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-outline-variant/10">
          {loading ? (
            <div className="px-6 py-8 text-center">
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-outline-variant/30 border-t-primary" />
            </div>
          ) : (
            <>
              {/* Payer list */}
              {payers.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {["Legal Name", "TIN", "Contact", "KYB Status", ""].map((h) => (
                          <th
                            key={h}
                            className="border-b border-outline-variant/10 px-6 py-3 text-left font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payers.map((p) => (
                        <tr key={p.id} className="border-b border-outline-variant/10">
                          <td className="px-6 py-3 font-body-md text-body-md text-on-surface">
                            {p.legalName}
                          </td>
                          <td className="px-6 py-3 font-mono text-sm text-on-surface-variant">
                            {p.tin}
                          </td>
                          <td className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant">
                            {p.contactEmail}
                          </td>
                          <td className="px-6 py-3">
                            <KybBadge status={p.kybStatus} />
                          </td>
                          <td className="px-6 py-3">
                            {p.kybStatus === "pending" ? (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => void reviewKyb(p.id, "verified")}
                                  className="font-label-sm text-label-sm text-[#2DD4BF] hover:underline"
                                >
                                  Verify
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void reviewKyb(p.id, "rejected")}
                                  className="font-label-sm text-label-sm text-on-surface-variant hover:text-red-400"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {payers.length === 0 && !showForm && (
                <div className="px-6 py-8 text-center">
                  <p className="mb-4 font-body-md text-body-md text-on-surface-variant">
                    No payers registered. Add the enterprise client who owes the invoice.
                  </p>
                </div>
              )}

              {/* Add payer form */}
              {showForm ? (
                <div className="border-t border-outline-variant/10 px-6 py-5">
                  <h4 className="mb-4 font-label-md text-label-md font-semibold text-on-surface">
                    Register Payer
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field
                      label="Legal Business Name"
                      value={form.legalName}
                      onChange={(v) => setForm((f) => ({ ...f, legalName: v }))}
                      placeholder="Acme Corp Inc."
                    />
                    <Field
                      label="TIN"
                      value={form.tin}
                      onChange={(v) => setForm((f) => ({ ...f, tin: v }))}
                      placeholder="000-000-000-000"
                    />
                    <Field
                      label="Contact Email"
                      value={form.contactEmail}
                      onChange={(v) => setForm((f) => ({ ...f, contactEmail: v }))}
                      placeholder="ap@acme.com"
                      type="email"
                    />
                  </div>
                  {formError && (
                    <p className="mt-2 font-label-sm text-label-sm text-red-400">{formError}</p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="teal"
                      size="sm"
                      disabled={submitting}
                      onClick={() => void handleSubmit()}
                    >
                      {submitting ? "Registering…" : "Register Payer"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setShowForm(false); setFormError(null); setForm(EMPTY_FORM); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end px-6 py-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="add"
                    onClick={() => setShowForm(true)}
                  >
                    Add payer
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-outline-variant/30 bg-surface-container-high px-3 py-2 font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
      />
    </label>
  );
}
