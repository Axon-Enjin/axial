import type { BirEisPayload } from "./types";

export type EisPayloadFieldDef = {
  key: keyof BirEisPayload;
  label: string;
  group: "Document" | "Seller" | "Buyer" | "Line item" | "Tax" | "Payment" | "Stellar audit";
  format?: "currency" | "number";
};

/** BIR EIS 20 mandatory fields + Axial audit fields (display order). */
export const EIS_PAYLOAD_FIELDS: EisPayloadFieldDef[] = [
  { key: "invoiceNumber", label: "Invoice number", group: "Document" },
  { key: "invoiceDate", label: "Invoice date", group: "Document" },
  { key: "sellerTin", label: "Seller TIN", group: "Seller" },
  { key: "sellerName", label: "Seller name", group: "Seller" },
  { key: "sellerAddress", label: "Seller address", group: "Seller" },
  { key: "buyerTin", label: "Buyer TIN", group: "Buyer" },
  { key: "buyerName", label: "Buyer name", group: "Buyer" },
  { key: "buyerAddress", label: "Buyer address", group: "Buyer" },
  { key: "description", label: "Description", group: "Line item" },
  { key: "quantity", label: "Quantity", group: "Line item", format: "number" },
  { key: "unitOfMeasure", label: "Unit of measure", group: "Line item" },
  { key: "unitPrice", label: "Unit price", group: "Line item", format: "currency" },
  { key: "grossAmount", label: "Gross amount", group: "Tax", format: "currency" },
  { key: "vatExemptAmount", label: "VAT-exempt amount", group: "Tax", format: "currency" },
  { key: "zeroRatedAmount", label: "Zero-rated amount", group: "Tax", format: "currency" },
  { key: "taxableAmount", label: "Taxable amount", group: "Tax", format: "currency" },
  { key: "vatAmount", label: "VAT amount", group: "Tax", format: "currency" },
  { key: "totalAmountDue", label: "Total amount due", group: "Tax", format: "currency" },
  { key: "transactionType", label: "Transaction type", group: "Payment" },
  { key: "paymentMode", label: "Payment mode", group: "Payment" },
  { key: "stellarTxHash", label: "Stellar transaction hash", group: "Stellar audit" },
  { key: "eventKind", label: "Ledger event kind", group: "Stellar audit" },
];

export function formatPayloadValue(
  key: keyof BirEisPayload,
  value: string | number,
): string {
  const def = EIS_PAYLOAD_FIELDS.find((f) => f.key === key);
  if (def?.format === "currency" && typeof value === "number") {
    return `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (def?.format === "number" && typeof value === "number") {
    return String(value);
  }
  return String(value);
}
