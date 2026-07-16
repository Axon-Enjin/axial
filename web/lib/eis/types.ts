export type LedgerEventKind =
  | "receivable_minted"
  | "swap_executed"
  | "payroll_routed";

/**
 * EisSubmissionStatus state machine:
 *   queued (legacy) | prepared (awaiting human review)
 *     → on approve: submitted → acknowledged → memo_written
 *     | failed
 *
 * Terminal / in-flight (never re-submit BIR): prepared (until approve),
 * submitted, acknowledged, memo_written.
 * Retryable: failed only (legacy queued re-enters via prepare).
 */
export type EisSubmissionStatus =
  | "queued"
  | "prepared"
  | "submitted"
  | "acknowledged"
  | "memo_written"
  | "failed";

/** Minimal chain event the oracle consumes (from API hooks or future Horizon poll). */
export type ChainLedgerEvent = {
  kind: LedgerEventKind;
  referenceId: string;
  stellarTxHash: string;
  amount: number;
  advanceAmount?: number;
  /** Stellar network for memo write-back and RPC (defaults to mainnet when omitted). */
  network?: "testnet" | "mainnet";
};

/** BIR EIS 20-field schema (hackathon subset — demo values for seller/buyer). */
export type BirEisPayload = {
  invoiceNumber: string;
  invoiceDate: string;
  sellerTin: string;
  sellerName: string;
  sellerAddress: string;
  buyerTin: string;
  buyerName: string;
  buyerAddress: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  grossAmount: number;
  vatExemptAmount: number;
  zeroRatedAmount: number;
  taxableAmount: number;
  vatAmount: number;
  totalAmountDue: number;
  transactionType: string;
  paymentMode: string;
  stellarTxHash: string;
  eventKind: LedgerEventKind;
};

export type EisSubmission = {
  id: string;
  payloadId: string;
  idempotencyKey: string;
  status: EisSubmissionStatus;
  eventKind: LedgerEventKind;
  referenceId: string;
  stellarTxHash: string;
  birReferenceId: string | null;
  memoTxHash: string | null;
  memoText: string | null;
  jwsCompact: string;
  payload: BirEisPayload;
  createdAt: string;
  updatedAt: string;
  error?: string;
  /**
   * T+3 BIR EIS deadline: transactionDate + 3 calendar days.
   * Submissions not in memo_written by this time are considered expired.
   */
  dueBy?: string;
  /** ISO timestamp when the BIR submission was dispatched (status → submitted). */
  submittedAt?: string;
};

export type BirAcknowledgement = {
  accepted: boolean;
  birReferenceId: string;
  receivedAt: string;
};
