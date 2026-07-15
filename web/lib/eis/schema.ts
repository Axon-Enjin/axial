import type { BirEisPayload, ChainLedgerEvent } from "./types";
import { resolveEisPartyDefaults } from "@/lib/org/store";

function eventDescription(kind: ChainLedgerEvent["kind"]): string {
  switch (kind) {
    case "receivable_minted":
      return "B2B receivable tokenization — SAC mint on Stellar";
    case "swap_executed":
      return "Liquidity advance — atomic USDC swap on Stellar";
    case "payroll_routed":
      return "Statutory payroll routing — SSS / PhilHealth / Pag-IBIG";
  }
}

/** Map ledger event → BIR EIS 20-field JSON (amounts in PHP demo units). */
export async function mapLedgerEventToEisPayload(
  event: ChainLedgerEvent,
  orgId?: string | null,
): Promise<BirEisPayload> {
  const gross = event.amount;
  const taxable = Math.floor(gross * 0.88);
  const vat = Math.floor(taxable * 0.12);
  const today = new Date().toISOString().slice(0, 10);
  const parties = await resolveEisPartyDefaults(orgId);

  return {
    invoiceNumber: event.referenceId,
    invoiceDate: today,
    sellerTin: parties.seller.tin,
    sellerName: parties.seller.name,
    sellerAddress: parties.seller.address,
    buyerTin: parties.buyer.tin,
    buyerName: parties.buyer.name,
    buyerAddress: parties.buyer.address,
    description: eventDescription(event.kind),
    quantity: 1,
    unitOfMeasure: "service",
    unitPrice: gross,
    grossAmount: gross,
    vatExemptAmount: 0,
    zeroRatedAmount: 0,
    taxableAmount: taxable,
    vatAmount: vat,
    totalAmountDue: gross,
    transactionType: event.kind === "payroll_routed" ? "payroll" : "sale",
    paymentMode: "digital",
    stellarTxHash: event.stellarTxHash,
    eventKind: event.kind,
  };
}
