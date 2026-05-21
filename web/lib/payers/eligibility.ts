import { getInvoice } from "@/lib/invoices/store";
import type { EligibilityBlocker, EligibilityResult } from "./types";
import {
  getConfirmationByReceivable,
  getNoaByReceivable,
  getPayer,
} from "./store";

/**
 * CLS-05 — the single funding enforcement point.
 * No receivable may be swapped unless all three gates pass:
 * (1) payer KYB verified, (2) invoice confirmed by payer, (3) NoA acknowledged.
 *
 * Backward compat: if the invoice has payerConfirmed + noaAcknowledged set via
 * the demo single-click path, treat it as fundable without requiring the new
 * closed-loop records.
 */
export async function checkFundingEligibility(
  invoiceId: string,
): Promise<EligibilityResult> {
  const notFundable = (
    blockers: EligibilityBlocker[],
    partial?: Partial<Omit<EligibilityResult, "fundable" | "blockers">>,
  ): EligibilityResult => ({
    fundable: false,
    blockers,
    payerId: null,
    kybStatus: null,
    confirmationStatus: null,
    noaAckStatus: null,
    ...partial,
  });

  const invoice = await getInvoice(invoiceId);
  if (!invoice) {
    return notFundable(["payer_not_found"]);
  }

  // Demo fast-path: single-click confirm_payer set both flags directly on invoice
  if (invoice.payerConfirmed && invoice.noaAcknowledged) {
    return {
      fundable: true,
      blockers: [],
      payerId: null,
      kybStatus: "verified",
      confirmationStatus: "confirmed",
      noaAckStatus: "acknowledged",
    };
  }

  // Production closed-loop path
  const [confirmation, noa] = await Promise.all([
    getConfirmationByReceivable(invoiceId),
    getNoaByReceivable(invoiceId),
  ]);

  const blockers: EligibilityBlocker[] = [];
  let kybStatus: EligibilityResult["kybStatus"] = null;

  if (!confirmation || confirmation.status !== "confirmed") {
    blockers.push("confirmation");
  } else {
    const payer = await getPayer(confirmation.payerId);
    kybStatus = payer?.kybStatus ?? null;
    if (!payer || payer.kybStatus !== "verified") {
      blockers.push("payer_kyb");
    }
  }

  if (!noa || noa.ackStatus !== "acknowledged") {
    blockers.push("noa_ack");
  }

  return {
    fundable: blockers.length === 0,
    blockers,
    payerId: confirmation?.payerId ?? null,
    kybStatus,
    confirmationStatus: confirmation?.status ?? null,
    noaAckStatus: noa?.ackStatus ?? null,
  };
}
