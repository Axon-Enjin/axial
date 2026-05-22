export type RecourseStatus = "none" | "triggered" | "recovered" | "written_off";

export type ReserveLedgerEntry = {
  id: string;
  receivableId: string;
  faceAmount: number;
  advanceAmount: number;
  reserveHeld: number;
  funderAddress: string;
  msmeAddress: string;
  lockboxAddress: string;
  settlementTxHash: string | null;
  collectedAmount: number | null;
  shortfall: number;
  dueDate: string | null;
  recourseStatus: RecourseStatus;
  leakageDetectedAt: string | null;
  releasedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReconciliationResult = {
  scanned: number;
  settled: number;
  leaked: string[];
  errors: string[];
};
