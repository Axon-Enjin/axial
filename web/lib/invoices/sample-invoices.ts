import type { ParsedInvoice } from "./extract-fields";

export const SAMPLE_INVOICES: Record<string, ParsedInvoice> = {
  "8901": {
    invoiceId: "INV-2023-8901",
    party: "Acme Logistics Corp",
    terms: "Net 60",
    face: 125_000,
    buyerName: "Acme Logistics Corp",
    sellerName: "Axial Demo MSME Inc.",
    sellerTin: "123-456-789-00000",
    buyerTin: "987-654-321-00000",
    confidence: "high",
  },
  "8904": {
    invoiceId: "INV-2023-8904",
    party: "Nexus Tech Solutions",
    terms: "Net 90",
    face: 450_000,
    buyerName: "Nexus Tech Solutions",
    confidence: "high",
  },
};

export function resolveSampleId(raw: string | null): string | null {
  if (!raw) return "8901";
  const key = raw.replace(/^INV-2023-/i, "").trim();
  return SAMPLE_INVOICES[key] ? key : null;
}
