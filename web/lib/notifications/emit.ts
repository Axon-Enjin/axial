import { createNotification } from "./store";
import type { NotificationKind } from "./types";

/** Fire-and-forget calm notification emitters. */
export function emitNotification(input: {
  orgId?: string | null;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string | null;
}): void {
  void createNotification(input).catch(() => null);
}

export function emitFunded(orgId: string | null | undefined, receivableId: string, advancePhp: number) {
  emitNotification({
    orgId,
    kind: "funded",
    title: "Advance settled",
    body: `₱${advancePhp.toLocaleString()} advanced for ${receivableId.slice(0, 8)}…`,
    href: "/app/liquidity",
  });
}

export function emitLeaked(
  orgId: string | null | undefined,
  receivableId: string,
  shortfall?: number,
) {
  const shortfallText =
    shortfall && shortfall > 0 ? ` · shortfall ₱${shortfall.toLocaleString()}` : "";
  emitNotification({
    orgId,
    kind: "leaked",
    title: "Collection review",
    body: `Deal ${receivableId.slice(0, 8)}… passed grace without full payment${shortfallText}.`,
    href: "/app/liquidity#funder-book",
  });
}

export function emitOrgFrozen(orgId: string | null | undefined, reason: string) {
  emitNotification({
    orgId,
    kind: "org_frozen",
    title: "Funding paused",
    body: reason,
    href: "/app/settings",
  });
}

export function emitEisFailed(orgId: string | null | undefined, referenceId: string) {
  emitNotification({
    orgId,
    kind: "eis_failed",
    title: "EIS submission needs attention",
    body: `Pipeline stalled for ${referenceId}. Review in Compliance.`,
    href: "/app/compliance",
  });
}

export function emitDisputed(orgId: string | null | undefined, receivableId: string) {
  emitNotification({
    orgId,
    kind: "disputed",
    title: "Invoice disputed",
    body: `Payer disputed ${receivableId.slice(0, 8)}… — funding blocked.`,
    href: "/app/liquidity",
  });
}
