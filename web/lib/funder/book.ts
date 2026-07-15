import { getInvoice, listInvoices } from "@/lib/invoices/store";
import type { FactoringInvoice } from "@/lib/invoices/types";
import { checkFundingEligibility } from "@/lib/payers/eligibility";
import { DEFAULT_ADVANCE_BPS, quoteAdvance } from "@/lib/soroban/quote";
import { getReserveEntry } from "@/lib/settlement/store";
import type { ReserveLedgerEntry } from "@/lib/settlement/types";
import type {
  FunderBookPage,
  FunderBookSummary,
  FunderDealDetail,
  FunderDealRow,
  FunderDealStatus,
  FunderDiligence,
} from "./types";

function isFunderDeal(invoice: FactoringInvoice): boolean {
  return invoice.status === "settled" || Boolean(invoice.swapTxHash);
}

function deriveDealStatus(
  invoice: FactoringInvoice,
  reserve: ReserveLedgerEntry | null,
): FunderDealStatus {
  if (reserve?.recourseStatus === "triggered") {
    if ((reserve.shortfall ?? 0) > 0 && (reserve.collectedAmount ?? 0) > 0) {
      return "partial";
    }
    if (reserve.leakageDetectedAt || (reserve.shortfall ?? 0) > 0) {
      return "leaked";
    }
  }

  if (reserve?.releasedAt || invoice.collectionStatus === "collected") {
    if ((reserve?.shortfall ?? 0) > 0) return "partial";
    return "repaid";
  }

  if (invoice.collectionStatus === "open" && (invoice.swapTxHash || invoice.status === "settled")) {
    return "awaiting_collection";
  }

  return "advanced";
}

function buildDiligence(
  eligibility: Awaited<ReturnType<typeof checkFundingEligibility>>,
  reserveHeld: number | null,
): FunderDiligence {
  return {
    fundable: eligibility.fundable,
    blockers: eligibility.blockers,
    payerKybOk: eligibility.kybStatus === "verified",
    payerConfirmedOk:
      eligibility.confirmationStatus === "confirmed" || eligibility.fundable,
    noaAckOk: eligibility.noaAckStatus === "acknowledged" || eligibility.fundable,
    advanceBps: DEFAULT_ADVANCE_BPS,
    reserveHeld,
    recourseStatus: null,
  };
}

async function buildDealRow(
  invoice: FactoringInvoice,
  funderAddress?: string | null,
): Promise<FunderDealRow | null> {
  if (!isFunderDeal(invoice)) return null;

  const [reserve, eligibility] = await Promise.all([
    getReserveEntry(invoice.id),
    checkFundingEligibility(invoice.id),
  ]);

  if (
    funderAddress &&
    reserve?.funderAddress &&
    reserve.funderAddress !== funderAddress
  ) {
    return null;
  }

  const quote = quoteAdvance(invoice.face);
  const advanceAmount = invoice.immediate ?? reserve?.advanceAmount ?? quote.advance;
  const reserveHeld = reserve?.reserveHeld ?? quote.reserve;
  const dealStatus = deriveDealStatus(invoice, reserve);

  const diligence = buildDiligence(eligibility, reserveHeld);
  diligence.recourseStatus = reserve?.recourseStatus ?? null;

  return {
    receivableId: invoice.id,
    party: invoice.party,
    terms: invoice.terms,
    faceAmount: invoice.face,
    advanceAmount,
    reserveHeld,
    dealStatus,
    dueDate: reserve?.dueDate ?? null,
    collectedAmount: reserve?.collectedAmount ?? null,
    shortfall: reserve?.shortfall ?? null,
    diligence,
    mintTxHash: invoice.mintTxHash,
    swapTxHash: invoice.swapTxHash,
    settlementTxHash: reserve?.settlementTxHash ?? null,
    lockboxAddress: invoice.lockboxAddress,
    lockboxMemo: invoice.lockboxMemo,
    funderAddress: reserve?.funderAddress ?? funderAddress ?? null,
    updatedAt: invoice.updatedAt,
  };
}

function summarizeDeals(items: FunderDealRow[]): FunderBookSummary {
  return {
    totalDeals: items.length,
    advanced: items.filter((d) => d.dealStatus === "advanced").length,
    awaitingCollection: items.filter((d) => d.dealStatus === "awaiting_collection").length,
    repaid: items.filter((d) => d.dealStatus === "repaid").length,
    atRisk: items.filter((d) =>
      d.dealStatus === "leaked" || d.dealStatus === "partial",
    ).length,
  };
}

export async function listFunderBook(
  page: number,
  pageSize: number,
  funderAddress?: string | null,
): Promise<FunderBookPage> {
  const safePage = Math.max(1, page);
  const safeSize = Math.min(50, Math.max(1, pageSize));

  const { items: invoices } = await listInvoices(1, 500);
  const dealRows: FunderDealRow[] = [];

  for (const invoice of invoices) {
    const row = await buildDealRow(invoice, funderAddress);
    if (row) dealRows.push(row);
  }

  dealRows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const total = dealRows.length;
  const totalPages = Math.max(1, Math.ceil(total / safeSize));
  const start = (safePage - 1) * safeSize;
  const pageItems = dealRows.slice(start, start + safeSize);

  return {
    page: safePage,
    pageSize: safeSize,
    total,
    totalPages,
    funderAddress: funderAddress ?? null,
    summary: summarizeDeals(dealRows),
    items: pageItems,
  };
}

export async function getFunderDeal(
  receivableId: string,
  funderAddress?: string | null,
): Promise<FunderDealDetail | null> {
  const invoice = await getInvoice(receivableId);
  if (!invoice) return null;

  const row = await buildDealRow(invoice, funderAddress);
  if (!row) return null;

  return {
    ...row,
    invoiceStatus: invoice.status,
    collectionStatus: invoice.collectionStatus,
  };
}
