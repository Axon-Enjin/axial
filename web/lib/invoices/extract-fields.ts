export type ParsedInvoice = {
  invoiceId: string;
  party: string;
  terms: string;
  face: number;
  invoiceDate?: string;
  sellerName?: string;
  buyerName?: string;
  sellerTin?: string;
  buyerTin?: string;
  confidence: "high" | "medium" | "low";
};

function parseAmount(raw: string): number {
  const n = Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function pickLargestAmounts(text: string): number[] {
  const amounts: number[] = [];
  const patterns = [
    /TOTAL\s*AMOUNT\s*DUE[:\s]*(?:PHP\s*)?([\d,]+(?:\.\d{2})?)/gi,
    /Total\s*(?:Amount\s*)?Due[:\s]*(?:PHP\s*)?([\d,]+(?:\.\d{2})?)/gi,
    /(?:PHP|₱)\s*([\d,]+(?:\.\d{2})?)/gi,
    /\$\s*([\d,]+(?:\.\d{2})?)/gi,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const v = parseAmount(m[1]);
      if (v > 0) amounts.push(v);
    }
  }
  return amounts;
}

function extractParty(text: string): string | null {
  const billTo = text.match(
    /(?:BILL\s*TO|INVOICE\s*TO|BUYER|CUSTOMER)[:\s]*\n?\s*([A-Za-z0-9][A-Za-z0-9\s&.,'-]{2,60})/i,
  );
  if (billTo?.[1]) {
    return billTo[1].trim().split("\n")[0].trim();
  }
  const corp = text.match(
    /\b([A-Z][A-Za-z0-9\s&.'-]{3,50}(?:Corp|Corporation|Inc|Ltd|Logistics|Solutions|Systems|Freight))\b/,
  );
  return corp?.[1]?.trim() ?? null;
}

function extractSeller(text: string): string | null {
  const soldBy = text.match(
    /(?:FROM|SELLER|SUPPLIER|ISSUED\s*BY)[:\s]*\n?\s*([A-Za-z0-9][A-Za-z0-9\s&.,'-]{2,60})/i,
  );
  return soldBy?.[1]?.trim().split("\n")[0].trim() ?? null;
}

/** Map OCR / PDF text → Liquidity table + EIS-friendly fields. */
export function extractInvoiceFields(text: string): ParsedInvoice {
  const normalized = text.replace(/\s+/g, " ").trim();
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  const invPatterns = [
    /INV[-\s]?(\d{4})[-\s]?(\d{4,})/i,
    /Invoice\s*(?:No|Number|#)?[:\s]*([A-Z]{0,12}[-\s]?\d{4}[-\s]?\d{3,6})/i,
    /\b(20\d{2})[-\s](\d{4})\b/,
  ];
  let invoiceId: string | null = null;
  for (const re of invPatterns) {
    const m = normalized.match(re);
    if (m) {
      if (/^20\d{2}$/.test(m[1])) {
        invoiceId = `INV-${m[1]}-${m[2]}`;
      } else {
        invoiceId = m[0].replace(/\s+/g, "").toUpperCase();
        if (!invoiceId.startsWith("INV")) {
          invoiceId = `INV-${m[1]}-${m[2] ?? m[1]}`;
        }
      }
      break;
    }
  }

  const amounts = pickLargestAmounts(normalized);
  const face = amounts.length > 0 ? Math.max(...amounts) : 0;

  const net = normalized.match(/Net\s*(\d{1,3})/i);
  const terms = net ? `Net ${net[1]}` : "Net 60";

  const tins = [...normalized.matchAll(/\b(\d{3}-\d{3}-\d{3}-\d{5})\b/g)].map((m) => m[1]);
  const sellerTin = tins[0];
  const buyerTin = tins[1];

  const dateMatch = normalized.match(
    /(?:Invoice\s*)?Date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
  );

  const knownBuyer = normalized.match(
    /(Acme Logistics Corp|Nexus Tech Solutions|Global Freight Systems)/i,
  );
  const buyerName = knownBuyer?.[1] ?? extractParty(text) ?? extractParty(lines.join("\n"));
  const sellerName = extractSeller(text);
  const party = buyerName ?? sellerName ?? "Counterparty (review)";

  if (!invoiceId) {
    const lineInv = lines.find((l) => /INV-/i.test(l));
    if (lineInv) {
      const m = lineInv.match(/INV[-\w]+/i);
      invoiceId = m?.[0].toUpperCase() ?? null;
    }
  }

  const finalId = invoiceId ?? `INV-UPLOAD-${Date.now().toString(36).toUpperCase()}`;

  let confidence: ParsedInvoice["confidence"] = "low";
  if (invoiceId && face > 0) confidence = "high";
  else if (invoiceId || face > 0) confidence = "medium";

  return {
    invoiceId: finalId,
    party,
    terms,
    face: face > 0 ? face : 0,
    invoiceDate: dateMatch?.[1],
    sellerName: sellerName ?? undefined,
    buyerName: buyerName ?? undefined,
    sellerTin,
    buyerTin,
    confidence,
  };
}
