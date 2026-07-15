import { createHash, randomBytes } from "node:crypto";

export type KybStatus = "pending" | "verified" | "rejected";

export type Payer = {
  id: string;
  orgId: string;
  legalName: string;
  tin: string;
  contactEmail: string;
  kybStatus: KybStatus;
  kybVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConfirmationStatus = "pending" | "confirmed" | "disputed";

export type InvoiceConfirmation = {
  id: string;
  receivableId: string;
  payerId: string;
  confirmedAmount: number;
  dueDate: string;
  status: ConfirmationStatus;
  authToken: string;
  confirmedAt: string | null;
  disputeReason: string | null;
  disputedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AckStatus = "issued" | "acknowledged" | "refused";
export type AckMethod = "in_app" | "signed_pdf";

export type NoticeOfAssignment = {
  id: string;
  receivableId: string;
  payerId: string;
  noaDocumentRef: string;
  lockboxAddress: string;
  ackStatus: AckStatus;
  ackMethod: AckMethod | null;
  acknowledgedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EligibilityBlocker =
  | "payer_not_found"
  | "payer_kyb"
  | "confirmation"
  | "noa_ack"
  | "disputed"
  | "org_frozen"
  | "trust_boundary";

export type EligibilityResult = {
  fundable: boolean;
  blockers: EligibilityBlocker[];
  payerId: string | null;
  kybStatus: KybStatus | null;
  confirmationStatus: ConfirmationStatus | null;
  noaAckStatus: AckStatus | null;
};

export function generatePayerAuthToken(): string {
  return randomBytes(24).toString("base64url");
}

export function generateNoaDocumentRef(receivableId: string, payerId: string): string {
  const hash = createHash("sha256")
    .update(`noa:${receivableId}:${payerId}`)
    .digest("hex")
    .slice(0, 16)
    .toUpperCase();
  return `NOA-${hash}`;
}

export function newId(): string {
  return randomBytes(16).toString("hex");
}
