/**
 * Closed-loop journey — org- and invoice-level stage derivation for the
 * Connection Journey map (Overview + optional Liquidity strip).
 *
 * Composes existing dashboard / invoice / EIS signals — no new APIs.
 */

export type JourneyStageId =
  | "intake"
  | "trust"
  | "advance"
  | "use"
  | "compliance"
  | "collect"
  | "close";

export type JourneyStageStatus = "idle" | "active" | "done" | "blocked";

export type JourneyActor = "MSME" | "Payer" | "Funder" | "Chain" | "BIR";

export type JourneyStage = {
  id: JourneyStageId;
  title: string;
  actor: JourneyActor;
  blurb: string;
  href: string;
  icon: string;
  status: JourneyStageStatus;
};

export type OrgJourneyInput = {
  book?: {
    totalInvoices: number;
    fundableCount: number;
    settledCount: number;
    collectedCount?: number;
  } | null;
  eis?: { total: number; synchronized: number; pending?: number } | null;
  payroll?: { routed: number } | null;
  funder?: {
    atRisk?: number;
    repaid?: number;
    awaitingCollection?: number;
  } | null;
  orgFrozen?: boolean;
};

export type InvoiceJourneyInput = {
  status: "awaiting_payer" | "fundable" | "settled";
  payerConfirmed: boolean;
  noaAcknowledged: boolean;
  collectionStatus: "awaiting_payer" | "open" | "collected";
  mintTxHash?: string | null;
  swapTxHash?: string | null;
  disputed?: boolean;
};

const STAGE_META: Record<
  JourneyStageId,
  Omit<JourneyStage, "status">
> = {
  intake: {
    id: "intake",
    title: "Intake",
    actor: "MSME",
    blurb: "Upload & OCR into the book",
    href: "/app/liquidity",
    icon: "upload_file",
  },
  trust: {
    id: "trust",
    title: "Trust",
    actor: "Payer",
    blurb: "Confirm · acknowledge NoA",
    href: "/app/liquidity",
    icon: "verified_user",
  },
  advance: {
    id: "advance",
    title: "Advance",
    actor: "Funder",
    blurb: "Mint SAC · USDC swap",
    href: "/app/liquidity",
    icon: "token",
  },
  use: {
    id: "use",
    title: "Use funds",
    actor: "MSME",
    blurb: "Statutory payroll split",
    href: "/app/compliance",
    icon: "call_split",
  },
  compliance: {
    id: "compliance",
    title: "Compliance",
    actor: "BIR",
    blurb: "EIS ready for review",
    href: "/app/compliance",
    icon: "balance",
  },
  collect: {
    id: "collect",
    title: "Collect",
    actor: "Payer",
    blurb: "Pay lockbox at maturity",
    href: "/app/funder-portal",
    icon: "account_balance_wallet",
  },
  close: {
    id: "close",
    title: "Close",
    actor: "Chain",
    blurb: "Settle · repay · release",
    href: "/app/funder-portal",
    icon: "payments",
  },
};

const ORDER: JourneyStageId[] = [
  "intake",
  "trust",
  "advance",
  "use",
  "compliance",
  "collect",
  "close",
];

function pickActive(
  statuses: Record<JourneyStageId, JourneyStageStatus>,
): Record<JourneyStageId, JourneyStageStatus> {
  const firstOpen = ORDER.find(
    (id) => statuses[id] === "idle" || statuses[id] === "active",
  );
  if (!firstOpen) return statuses;

  const next = { ...statuses };
  for (const id of ORDER) {
    if (id === firstOpen && next[id] === "idle") {
      next[id] = "active";
      break;
    }
    if (id === firstOpen) break;
  }
  // Ensure only one active when possible
  let seenActive = false;
  for (const id of ORDER) {
    if (next[id] === "active") {
      if (seenActive) next[id] = "idle";
      else seenActive = true;
    }
  }
  return next;
}

/** Derive org-level closed-loop journey from dashboard aggregates. */
export function deriveOrgJourney(input: OrgJourneyInput): JourneyStage[] {
  const total = input.book?.totalInvoices ?? 0;
  const fundable = input.book?.fundableCount ?? 0;
  const settled = input.book?.settledCount ?? 0;
  const collected =
    input.book?.collectedCount ?? input.funder?.repaid ?? 0;
  const awaiting = input.funder?.awaitingCollection ?? 0;
  const atRisk = input.funder?.atRisk ?? 0;
  const eisTotal = input.eis?.total ?? 0;
  const eisSync = input.eis?.synchronized ?? 0;
  const eisPending = input.eis?.pending ?? Math.max(0, eisTotal - eisSync);
  const payrollRouted = input.payroll?.routed ?? 0;
  const frozen = Boolean(input.orgFrozen);

  const statuses: Record<JourneyStageId, JourneyStageStatus> = {
    intake: total > 0 ? "done" : "idle",
    trust:
      fundable > 0 || settled > 0
        ? "done"
        : total > 0
          ? "idle"
          : "idle",
    advance: settled > 0 ? "done" : fundable > 0 ? "idle" : "idle",
    use: payrollRouted > 0 ? "done" : settled > 0 ? "idle" : "idle",
    compliance:
      eisSync > 0
        ? "done"
        : eisPending > 0 || eisTotal > 0
          ? "idle"
          : "idle",
    collect:
      collected > 0
        ? "done"
        : awaiting > 0 || settled > 0
          ? "idle"
          : "idle",
    close:
      collected > 0 && settled > 0
        ? "done"
        : atRisk > 0
          ? "blocked"
          : collected > 0 || awaiting > 0
            ? "idle"
            : "idle",
  };

  // Trust: if invoices exist but none fundable/settled → still in trust gate
  if (total > 0 && fundable === 0 && settled === 0) {
    statuses.trust = "idle";
  }

  // Advance waiting when fundable exists
  if (fundable > 0 && settled === 0) {
    statuses.advance = "idle";
  }

  // Compliance: pending submissions → treat as in-flight before pickActive
  if (eisPending > 0 && eisSync === 0) {
    statuses.compliance = "idle";
  }

  if (frozen) {
    for (const id of ORDER) {
      if (statuses[id] !== "done") statuses[id] = "blocked";
    }
  }

  const resolved = frozen ? statuses : pickActive(statuses);

  // Prefer compliance as active when EIS is bridging and advance is done
  if (
    !frozen &&
    eisPending > 0 &&
    statuses.advance === "done" &&
    statuses.compliance !== "done"
  ) {
    for (const id of ORDER) {
      if (id === "compliance") resolved[id] = "active";
      else if (resolved[id] === "active") resolved[id] = "idle";
    }
  }

  // Prefer collect/close when funder awaiting or at risk
  if (!frozen && atRisk > 0) {
    resolved.close = "blocked";
  } else if (
    !frozen &&
    awaiting > 0 &&
    statuses.collect !== "done" &&
    statuses.advance === "done"
  ) {
    for (const id of ORDER) {
      if (id === "collect") resolved[id] = "active";
      else if (resolved[id] === "active" && id !== "collect")
        resolved[id] = "idle";
    }
  }

  return ORDER.map((id) => ({
    ...STAGE_META[id],
    status: resolved[id],
  }));
}

/** Derive journey for a single invoice (Liquidity strip). */
export function deriveInvoiceJourney(
  inv: InvoiceJourneyInput,
): JourneyStage[] {
  const confirmed = inv.payerConfirmed && inv.noaAcknowledged;
  const advanced =
    inv.status === "settled" || Boolean(inv.swapTxHash ?? inv.mintTxHash);
  const collected = inv.collectionStatus === "collected";
  const lockboxOpen = inv.collectionStatus === "open";

  const statuses: Record<JourneyStageId, JourneyStageStatus> = {
    intake: "done",
    trust: confirmed ? "done" : "idle",
    advance: advanced ? "done" : confirmed ? "idle" : "idle",
    use: advanced ? "idle" : "idle",
    compliance: advanced ? "idle" : "idle",
    collect: collected ? "done" : lockboxOpen || advanced ? "idle" : "idle",
    close: collected ? "done" : "idle",
  };

  if (inv.disputed) {
    statuses.trust = "blocked";
    for (const id of ["advance", "use", "compliance", "collect", "close"] as const) {
      if (statuses[id] !== "done") statuses[id] = "blocked";
    }
  }

  const resolved = inv.disputed ? statuses : pickActive(statuses);

  return ORDER.map((id) => ({
    ...STAGE_META[id],
    status: resolved[id],
  }));
}
