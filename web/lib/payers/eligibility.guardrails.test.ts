import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/invoices/store", () => ({
  getInvoice: vi.fn(),
}));

vi.mock("@/lib/org/store", () => ({
  resolveOrgId: vi.fn(() => "demo-org"),
  getOrgProfile: vi.fn(async () => ({
    id: "demo-org",
    name: "Demo",
    slug: "demo",
    trustBoundaryAckedAt: "2026-01-01T00:00:00.000Z",
    sellerTin: null,
    sellerName: null,
    sellerAddress: null,
    buyerTinDefault: null,
    buyerNameDefault: null,
    buyerAddressDefault: null,
    frozenAt: null,
    freezeReason: null,
  })),
  isOrgFrozen: vi.fn(() => false),
  isTrustBoundaryAcked: vi.fn(async () => true),
}));

vi.mock("@/lib/payers/store", () => ({
  getConfirmationByReceivable: vi.fn(async () => null),
  getNoaByReceivable: vi.fn(async () => null),
  getPayer: vi.fn(),
}));

import { getInvoice } from "@/lib/invoices/store";
import { checkFundingEligibility } from "./eligibility";

describe("checkFundingEligibility demo fast-path", () => {
  const prev = process.env.AXIAL_ALLOW_SEED;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getInvoice).mockResolvedValue({
      id: "inv-1",
      party: "Acme",
      terms: "Net 60",
      face: 1000,
      immediate: 850,
      status: "fundable",
      payerConfirmed: true,
      noaAcknowledged: true,
      lockboxAddress: null,
      lockboxMemo: null,
      collectionStatus: "awaiting_payer",
      mintTxHash: null,
      swapTxHash: null,
      onChainInvoiceId: null,
      faceUsdc: null,
      attributedInflowUsdc: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.AXIAL_ALLOW_SEED;
    else process.env.AXIAL_ALLOW_SEED = prev;
  });

  it("does not trust invoice flags alone when seed is off", async () => {
    delete process.env.AXIAL_ALLOW_SEED;
    const result = await checkFundingEligibility("inv-1");
    expect(result.fundable).toBe(false);
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it("allows invoice-flag fast-path when seed is on", async () => {
    process.env.AXIAL_ALLOW_SEED = "true";
    const result = await checkFundingEligibility("inv-1");
    expect(result.fundable).toBe(true);
  });
});
