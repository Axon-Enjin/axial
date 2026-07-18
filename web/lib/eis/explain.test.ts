import { describe, expect, it } from "vitest";
import { explainEisPayload } from "./explain";
import type { BirEisPayload } from "./types";

function basePayload(over: Partial<BirEisPayload> = {}): BirEisPayload {
  const gross = 100_000;
  const taxable = Math.floor(gross * 0.88);
  const vat = Math.floor(taxable * 0.12);
  return {
    invoiceNumber: "INV-1",
    invoiceDate: "2026-07-17",
    sellerTin: "123-456-789-00000",
    sellerName: "Seller",
    sellerAddress: "Makati",
    buyerTin: "987-654-321-00000",
    buyerName: "Buyer",
    buyerAddress: "BGC",
    description: "sale",
    quantity: 1,
    unitOfMeasure: "service",
    unitPrice: gross,
    grossAmount: gross,
    vatExemptAmount: 0,
    zeroRatedAmount: 0,
    taxableAmount: taxable,
    vatAmount: vat,
    totalAmountDue: gross,
    transactionType: "sale",
    paymentMode: "digital",
    stellarTxHash: "abc",
    eventKind: "swap_executed",
    ...over,
  };
}

describe("explainEisPayload", () => {
  it("passes a well-formed payload", () => {
    const result = explainEisPayload({ payload: basePayload() });
    expect(result.readyToApprove).toBe(true);
    expect(result.findings.some((f) => f.severity === "block")).toBe(false);
  });

  it("blocks on missing seller TIN", () => {
    const result = explainEisPayload({
      payload: basePayload({ sellerTin: "" }),
    });
    expect(result.readyToApprove).toBe(false);
    expect(result.findings.some((f) => f.code === "seller_tin_missing")).toBe(true);
  });

  it("warns on VAT math drift", () => {
    const result = explainEisPayload({
      payload: basePayload({ vatAmount: 1 }),
    });
    expect(result.findings.some((f) => f.code === "vat_math")).toBe(true);
  });

  it("flags closing T+3 window", () => {
    const dueBy = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
    const result = explainEisPayload({ payload: basePayload(), dueBy });
    expect(result.findings.some((f) => f.code === "t3_closing")).toBe(true);
  });
});
