/** Demo closed-loop trust layer — payer confirm, NoA, per-invoice lockbox. */

import type { CollectionStatus } from "@/lib/invoices/types";

export type { CollectionStatus };

export type InvoiceTrustState = {
  payerConfirmed: boolean;
  noaAcknowledged: boolean;
  lockboxAddress: string | null;
  lockboxMemo: string | null;
  collectionStatus: CollectionStatus;
};

export function deriveDemoLockbox(invoiceId: string): { address: string; memo: string } {
  const slug = invoiceId.replace(/[^A-Z0-9]/gi, "").slice(-12).toUpperCase();
  const memo = `AXL${slug}`.slice(0, 28);
  const padded = slug.padEnd(48, "X");
  return {
    address: `GAXL${padded.slice(0, 52)}`,
    memo,
  };
}

export function isFundable(trust: InvoiceTrustState): boolean {
  return trust.payerConfirmed && trust.noaAcknowledged;
}

/** One-line hint for the factoring table (no badges). */
export function trustHint(trust: InvoiceTrustState): string {
  if (!trust.payerConfirmed) return "Needs payer confirmation";
  if (!trust.noaAcknowledged) return "Needs notice of assignment";
  if (trust.collectionStatus === "open") return "Lockbox ready — payer pays at maturity";
  if (trust.collectionStatus === "settling") return "Settlement in progress";
  if (trust.collectionStatus === "collected") return "Payer paid lockbox";
  return "Ready to tokenize";
}

export function reserveFromFace(face: number, advance: number): number {
  return Math.max(0, face - advance);
}

export function parseNetDays(terms: string): number {
  const m = terms.match(/Net\s*(\d+)/i);
  return m ? Number(m[1]) : 60;
}

export function initialTrustForDemo(
  preset: "confirmed" | "pending" | "collected",
  invoiceId: string,
): InvoiceTrustState {
  if (preset === "pending") {
    return {
      payerConfirmed: false,
      noaAcknowledged: false,
      lockboxAddress: null,
      lockboxMemo: null,
      collectionStatus: "awaiting_payer",
    };
  }
  const { address, memo } = deriveDemoLockbox(invoiceId);
  return {
    payerConfirmed: true,
    noaAcknowledged: true,
    lockboxAddress: address,
    lockboxMemo: memo,
    collectionStatus: preset === "collected" ? "collected" : "awaiting_payer",
  };
}
