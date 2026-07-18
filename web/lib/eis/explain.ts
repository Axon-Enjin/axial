import type { BirEisPayload } from "./types";

export type EisExplainSeverity = "info" | "warn" | "block";

export type EisExplainFinding = {
  code: string;
  severity: EisExplainSeverity;
  message: string;
  field?: keyof BirEisPayload;
};

export type EisExplainResult = {
  findings: EisExplainFinding[];
  summary: string;
  readyToApprove: boolean;
};

export type EisExplainInput = {
  payload: BirEisPayload;
  dueBy?: string | null;
  sellerTinDefault?: string | null;
  buyerTinDefault?: string | null;
};

const TIN_RE = /^\d{3}-\d{3}-\d{3}-\d{5}$/;

function hoursUntil(dueBy: string): number {
  return (new Date(dueBy).getTime() - Date.now()) / (1000 * 60 * 60);
}

/**
 * Rule-based Co-Pilot explain. Deterministic checks only — no LLM.
 * Surfaces beside Approve; never submits to BIR.
 */
export function explainEisPayload(input: EisExplainInput): EisExplainResult {
  const { payload, dueBy, sellerTinDefault, buyerTinDefault } = input;
  const findings: EisExplainFinding[] = [];

  if (!payload.sellerTin?.trim()) {
    findings.push({
      code: "seller_tin_missing",
      severity: "block",
      message: "Seller TIN is empty.",
      field: "sellerTin",
    });
  } else if (!TIN_RE.test(payload.sellerTin)) {
    findings.push({
      code: "seller_tin_format",
      severity: "warn",
      message: "Seller TIN does not match 000-000-000-00000.",
      field: "sellerTin",
    });
  }

  if (!payload.buyerTin?.trim()) {
    findings.push({
      code: "buyer_tin_missing",
      severity: "block",
      message: "Buyer TIN is empty.",
      field: "buyerTin",
    });
  } else if (!TIN_RE.test(payload.buyerTin)) {
    findings.push({
      code: "buyer_tin_format",
      severity: "warn",
      message: "Buyer TIN does not match 000-000-000-00000.",
      field: "buyerTin",
    });
  }

  if (
    sellerTinDefault &&
    payload.sellerTin &&
    payload.sellerTin !== sellerTinDefault
  ) {
    findings.push({
      code: "seller_tin_mismatch",
      severity: "info",
      message: "Seller TIN differs from org tax profile default.",
      field: "sellerTin",
    });
  }

  if (
    buyerTinDefault &&
    payload.buyerTin &&
    payload.buyerTin !== buyerTinDefault
  ) {
    findings.push({
      code: "buyer_tin_mismatch",
      severity: "info",
      message: "Buyer TIN differs from org default buyer TIN.",
      field: "buyerTin",
    });
  }

  const expectedTaxable = Math.floor(payload.grossAmount * 0.88);
  const expectedVat = Math.floor(expectedTaxable * 0.12);
  if (payload.taxableAmount !== expectedTaxable) {
    findings.push({
      code: "taxable_math",
      severity: "warn",
      message: `Taxable amount ${payload.taxableAmount} ≠ floor(gross×0.88)=${expectedTaxable}.`,
      field: "taxableAmount",
    });
  }
  if (payload.vatAmount !== expectedVat) {
    findings.push({
      code: "vat_math",
      severity: "warn",
      message: `VAT amount ${payload.vatAmount} ≠ floor(taxable×0.12)=${expectedVat}.`,
      field: "vatAmount",
    });
  }
  if (payload.totalAmountDue !== payload.grossAmount) {
    findings.push({
      code: "total_vs_gross",
      severity: "warn",
      message: "Total amount due does not equal gross amount.",
      field: "totalAmountDue",
    });
  }

  if (!payload.invoiceNumber?.trim()) {
    findings.push({
      code: "invoice_number_missing",
      severity: "block",
      message: "Invoice number is empty.",
      field: "invoiceNumber",
    });
  }
  if (!payload.stellarTxHash?.trim()) {
    findings.push({
      code: "stellar_hash_missing",
      severity: "warn",
      message: "Stellar transaction hash is empty.",
      field: "stellarTxHash",
    });
  }

  if (dueBy) {
    const hrs = hoursUntil(dueBy);
    if (hrs <= 0) {
      findings.push({
        code: "t3_expired",
        severity: "block",
        message: "T+3 filing window has closed.",
      });
    } else if (hrs <= 24) {
      findings.push({
        code: "t3_closing",
        severity: "warn",
        message: `T+3 window closes in about ${Math.ceil(hrs)} hours.`,
      });
    } else {
      findings.push({
        code: "t3_ok",
        severity: "info",
        message: `T+3 window still open (~${Math.ceil(hrs / 24)} days remaining).`,
      });
    }
  }

  const blocked = findings.some((f) => f.severity === "block");
  const warns = findings.filter((f) => f.severity === "warn").length;
  const summary = blocked
    ? "Resolve blocking issues before approving."
    : warns > 0
      ? `${warns} item${warns === 1 ? "" : "s"} to double-check before approve.`
      : "Mapped fields look consistent with org defaults and VAT math.";

  return {
    findings,
    summary,
    readyToApprove: !blocked,
  };
}
