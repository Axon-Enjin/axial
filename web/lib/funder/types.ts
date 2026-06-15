import type { EligibilityBlocker } from "@/lib/payers/types";
import type { RecourseStatus } from "@/lib/settlement/types";

export type FunderDealStatus =
  | "advanced"
  | "awaiting_collection"
  | "repaid"
  | "partial"
  | "leaked";

export type FunderDiligence = {
  fundable: boolean;
  blockers: EligibilityBlocker[];
  payerKybOk: boolean;
  payerConfirmedOk: boolean;
  noaAckOk: boolean;
  advanceBps: number;
  reserveHeld: number | null;
  recourseStatus: RecourseStatus | null;
};

export type FunderDealRow = {
  receivableId: string;
  party: string;
  terms: string;
  faceAmount: number;
  advanceAmount: number | null;
  reserveHeld: number | null;
  dealStatus: FunderDealStatus;
  dueDate: string | null;
  collectedAmount: number | null;
  shortfall: number | null;
  diligence: FunderDiligence;
  mintTxHash: string | null;
  swapTxHash: string | null;
  settlementTxHash: string | null;
  lockboxAddress: string | null;
  lockboxMemo: string | null;
  funderAddress: string | null;
  updatedAt: string;
};

export type FunderBookSummary = {
  totalDeals: number;
  advanced: number;
  awaitingCollection: number;
  repaid: number;
  atRisk: number;
};

export type FunderBookPage = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  funderAddress: string | null;
  summary: FunderBookSummary;
  items: FunderDealRow[];
};

export type FunderDealDetail = FunderDealRow & {
  invoiceStatus: string;
  collectionStatus: string;
};
