import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/eis/trigger", () => ({
  triggerEisFromChain: vi.fn(),
}));

vi.mock("@/lib/invoices/store", () => ({
  getInvoice: vi.fn(),
  setInvoiceFaceUsdc: vi.fn(),
}));

vi.mock("@/lib/notifications/emit", () => ({
  emitFunded: vi.fn(),
}));

vi.mock("@/lib/org/store", () => ({
  resolveOrgId: vi.fn(() => "demo-org"),
}));

vi.mock("@/lib/payers/eligibility", () => ({
  checkFundingEligibility: vi.fn(),
}));

vi.mock("@/lib/soroban/config", () => ({
  isSwapChainEnabled: vi.fn(() => false),
}));

vi.mock("@/lib/soroban/server-config", () => ({
  resolveSorobanConfig: vi.fn(async () => ({})),
}));

vi.mock("@/lib/soroban/invoke-swap", () => ({
  executeAdvanceOnChain: vi.fn(),
}));

vi.mock("@/lib/soroban/invoke-settlement", () => ({
  isSettlementChainEnabled: vi.fn(() => false),
  registerInvoiceOnChain: vi.fn(),
}));

vi.mock("@/lib/soroban/quote", () => ({
  quoteAdvance: vi.fn((face: number) => ({
    advance: Math.trunc(face * 0.85),
    reserve: face - Math.trunc(face * 0.85),
  })),
}));

vi.mock("@/lib/soroban/usdc-preflight", () => ({
  assertSwapPreflight: vi.fn(async () => ({ ok: true })),
}));

vi.mock("@/lib/fx/convert", () => ({
  resolveFaceUsdc: vi.fn(async (php: number) => ({
    faceUsdc: Math.trunc(php / 56.5),
    phpPerUsdc: 56.5,
    source: "fallback",
  })),
}));

import { POST } from "./route";
import { checkFundingEligibility } from "@/lib/payers/eligibility";
import { getInvoice } from "@/lib/invoices/store";

describe("POST /api/swap/execute guardrails", () => {
  const prevSeed = process.env.AXIAL_ALLOW_SEED;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (prevSeed === undefined) delete process.env.AXIAL_ALLOW_SEED;
    else process.env.AXIAL_ALLOW_SEED = prevSeed;
  });

  it("requires explicit sourceInvoiceId when not in seed mode", async () => {
    delete process.env.AXIAL_ALLOW_SEED;
    const res = await POST(
      new Request("http://localhost/api/swap/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ invoiceId: "inv-x", faceAmount: 1000 }),
      }),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/sourceInvoiceId/i);
  });

  it("fails closed when eligibility throws (non-seed)", async () => {
    delete process.env.AXIAL_ALLOW_SEED;
    vi.mocked(checkFundingEligibility).mockRejectedValueOnce(new Error("store down"));
    const res = await POST(
      new Request("http://localhost/api/swap/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          invoiceId: "inv-x",
          sourceInvoiceId: "inv-x",
          faceAmount: 1000,
        }),
      }),
    );
    expect(res.status).toBe(502);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("store down");
  });

  it("rejects already-funded invoices", async () => {
    process.env.AXIAL_ALLOW_SEED = "true";
    vi.mocked(getInvoice).mockResolvedValueOnce({
      id: "inv-x",
      party: "Acme",
      terms: "Net 60",
      face: 1000,
      immediate: 850,
      status: "settled",
      payerConfirmed: true,
      noaAcknowledged: true,
      lockboxAddress: null,
      lockboxMemo: null,
      collectionStatus: "open",
      mintTxHash: "m",
      swapTxHash: "s",
      onChainInvoiceId: "inv-x",
      faceUsdc: 17,
      attributedInflowUsdc: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const res = await POST(
      new Request("http://localhost/api/swap/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          invoiceId: "inv-x",
          sourceInvoiceId: "inv-x",
          faceAmount: 1000,
        }),
      }),
    );
    expect(res.status).toBe(409);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("ALREADY_FUNDED");
  });
});
