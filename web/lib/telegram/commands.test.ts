import { describe, expect, it } from "vitest";
import { explainEisPayload } from "@/lib/eis/explain";
import type { BirEisPayload } from "@/lib/eis/types";

/** Sanity: telegram /eis formatting uses the same explain helper. */
describe("telegram explain reuse", () => {
  it("summarizes prepared filings for chat copy", () => {
    const payload = {
      invoiceNumber: "INV-1",
      invoiceDate: "2026-07-17",
      sellerTin: "123-456-789-00000",
      sellerName: "S",
      sellerAddress: "A",
      buyerTin: "987-654-321-00000",
      buyerName: "B",
      buyerAddress: "C",
      description: "sale",
      quantity: 1,
      unitOfMeasure: "service",
      unitPrice: 1000,
      grossAmount: 1000,
      vatExemptAmount: 0,
      zeroRatedAmount: 0,
      taxableAmount: 880,
      vatAmount: 105,
      totalAmountDue: 1000,
      transactionType: "sale",
      paymentMode: "digital",
      stellarTxHash: "x",
      eventKind: "swap_executed",
    } as BirEisPayload;

    const result = explainEisPayload({ payload });
    expect(result.summary.length).toBeGreaterThan(0);
  });
});
