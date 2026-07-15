import {
  getConfirmationByReceivable,
  getConfirmationByToken,
  updateConfirmationStatus,
} from "./store";

export async function disputeInvoiceByToken(
  token: string,
  reason: string,
): Promise<{ receivableId: string }> {
  const confirmation = await getConfirmationByToken(token);
  if (!confirmation) throw new Error("Invalid or expired confirmation token");
  if (confirmation.status === "disputed") {
    return { receivableId: confirmation.receivableId };
  }

  await updateConfirmationStatus(confirmation.id, {
    status: "disputed",
    disputeReason: reason.trim() || "Payer disputed invoice terms",
    disputedAt: new Date().toISOString(),
  });

  return { receivableId: confirmation.receivableId };
}

export async function listDisputesForReceivable(receivableId: string) {
  const confirmation = await getConfirmationByReceivable(receivableId);
  if (!confirmation || confirmation.status !== "disputed") return [];
  return [
    {
      receivableId,
      reason: confirmation.disputeReason ?? "Disputed",
      disputedAt: confirmation.disputedAt,
    },
  ];
}
