import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/invoices/store", () => ({
  getInvoice: vi.fn(),
}));

vi.mock("@/lib/msme/invoice-trust", () => ({
  deriveDemoLockbox: vi.fn(() => ({ address: "GAXL", memo: "m" })),
}));

vi.mock("@/lib/payers/store", () => ({
  confirmInvoiceByToken: vi.fn(),
  getConfirmationByReceivable: vi.fn(async () => ({
    id: "c1",
    receivableId: "inv-1",
    payerId: "p1",
    status: "pending",
    authToken: "secret-magic-token",
    confirmedAmount: 100,
    dueDate: "2026-01-01",
    confirmedAt: null,
    disputeReason: null,
    disputedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  })),
  issueNoa: vi.fn(),
  requestConfirmation: vi.fn(),
}));

vi.mock("@/lib/soroban/server-config", () => ({
  resolveSorobanConfig: vi.fn(async () => ({})),
}));

import { GET } from "./route";

describe("GET /api/invoices/:id/confirm redaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("never returns the raw authToken", async () => {
    const res = await GET(new Request("http://localhost/api/invoices/inv-1/confirm"), {
      params: Promise.resolve({ id: "inv-1" }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      confirmation: { authToken: string | null };
    };
    expect(body.confirmation.authToken).toBeNull();
    expect(JSON.stringify(body)).not.toContain("secret-magic-token");
  });
});
