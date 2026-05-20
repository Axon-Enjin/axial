import type { BirEisPayload, ChainLedgerEvent } from "./types";

const DEMO_SELLER = {
  tin: process.env.AXIAL_SELLER_TIN ?? "123-456-789-00000",
  name: process.env.AXIAL_SELLER_NAME ?? "Axial Demo MSME Inc.",
  address: process.env.AXIAL_SELLER_ADDRESS ?? "Makati City, Metro Manila, PH",
};

const DEMO_BUYER = {
  tin: process.env.AXIAL_BUYER_TIN ?? "987-654-321-00000",
  name: process.env.AXIAL_BUYER_NAME ?? "Acme Logistics Corp",
  address: process.env.AXIAL_BUYER_ADDRESS ?? "BGC, Taguig City, Metro Manila, PH",
};

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
export function mapLedgerEventToEisPayload(event: ChainLedgerEvent): BirEisPayload {
  const gross = event.amount;
  const taxable = Math.floor(gross * 0.88);
  const vat = Math.floor(taxable * 0.12);
  const today = new Date().toISOString().slice(0, 10);

  return {
    invoiceNumber: event.referenceId,
    invoiceDate: today,
    sellerTin: DEMO_SELLER.tin,
    sellerName: DEMO_SELLER.name,
    sellerAddress: DEMO_SELLER.address,
    buyerTin: DEMO_BUYER.tin,
    buyerName: DEMO_BUYER.name,
    buyerAddress: DEMO_BUYER.address,
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
