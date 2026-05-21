export type LedgerEventKind =
  | "receivable_minted"
  | "swap_executed"
  | "payroll_routed";

export type EisSubmissionStatus =
  | "queued"
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
};

export type BirAcknowledgement = {
  accepted: boolean;
  birReferenceId: string;
  receivedAt: string;
};
