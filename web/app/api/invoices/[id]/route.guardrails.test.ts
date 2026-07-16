import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/invoices/store", () => ({
  confirmPayerInvoice: vi.fn(async (id: string) => ({
    id,
    status: "fundable",
    payerConfirmed: true,
    noaAcknowledged: true,
  })),
  getInvoice: vi.fn(),
  markCollectedInvoice: vi.fn(),
  settleInvoice: vi.fn(),
  beginCollectingInvoice: vi.fn(),
  revertCollectingInvoice: vi.fn(),
  attributeLockboxInflow: vi.fn(),
  setInvoiceFaceUsdc: vi.fn(),
}));

vi.mock("@/lib/settlement/store", () => ({
  markEntrySettled: vi.fn(),
  upsertReserveEntry: vi.fn(),
}));

vi.mock("@/lib/soroban/server-config", () => ({
  resolveSorobanConfig: vi.fn(async () => ({})),
}));

vi.mock("@/lib/soroban/invoke-settlement", () => ({
  isSettlementChainEnabled: vi.fn(() => false),
  settleOnChain: vi.fn(),
}));

vi.mock("@/lib/soroban/quote", () => ({
  quoteAdvance: vi.fn((face: number) => ({
    advance: Math.trunc(face * 0.85),
    reserve: face - Math.trunc(face * 0.85),
  })),
}));

vi.mock("@/lib/msme/invoice-trust", () => ({
  deriveDemoLockbox: vi.fn(() => ({ address: "GAXL", memo: "m" })),
  parseNetDays: vi.fn(() => 60),
}));

vi.mock("@/lib/fx/convert", () => ({
  resolveFaceUsdc: vi.fn(async (php: number) => ({
    faceUsdc: Math.trunc(php / 56.5),
    phpPerUsdc: 56.5,
    source: "fallback",
  })),
  phpToUsdcWhole: vi.fn((php: number, rate: number) => Math.trunc(php / rate)),
}));

import { PATCH } from "./route";
import { confirmPayerInvoice } from "@/lib/invoices/store";

describe("PATCH /api/invoices/:id confirm_payer gate", () => {
  const prevSeed = process.env.AXIAL_ALLOW_SEED;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (prevSeed === undefined) delete process.env.AXIAL_ALLOW_SEED;
    else process.env.AXIAL_ALLOW_SEED = prevSeed;
  });

  it("returns 403 when AXIAL_ALLOW_SEED is not true", async () => {
    delete process.env.AXIAL_ALLOW_SEED;
    const res = await PATCH(
      new Request("http://localhost/api/invoices/inv-1", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "confirm_payer" }),
      }),
      { params: Promise.resolve({ id: "inv-1" }) },
    );
    expect(res.status).toBe(403);
    expect(confirmPayerInvoice).not.toHaveBeenCalled();
  });

  it("allows confirm_payer when AXIAL_ALLOW_SEED=true", async () => {
    process.env.AXIAL_ALLOW_SEED = "true";
    const res = await PATCH(
      new Request("http://localhost/api/invoices/inv-1", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "confirm_payer" }),
      }),
      { params: Promise.resolve({ id: "inv-1" }) },
    );
    expect(res.status).toBe(200);
    expect(confirmPayerInvoice).toHaveBeenCalledWith("inv-1");
  });
});
