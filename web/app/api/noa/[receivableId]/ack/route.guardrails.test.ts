import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/payers/store", () => ({
  acknowledgeNoa: vi.fn(async () => ({
    id: "noa-1",
    receivableId: "inv-1",
    ackStatus: "acknowledged",
  })),
  getConfirmationByToken: vi.fn(),
  getNoaByReceivable: vi.fn(),
}));

vi.mock("@/lib/invoices/store", () => ({
  confirmPayerInvoice: vi.fn(async () => ({ id: "inv-1" })),
}));

import { POST } from "./route";
import { acknowledgeNoa, getConfirmationByToken } from "@/lib/payers/store";

describe("POST /api/noa/:id/ack token gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without token", async () => {
    const res = await POST(
      new Request("http://localhost/api/noa/inv-1/ack", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ receivableId: "inv-1" }) },
    );
    expect(res.status).toBe(401);
    expect(acknowledgeNoa).not.toHaveBeenCalled();
  });

  it("returns 401 for invalid token", async () => {
    vi.mocked(getConfirmationByToken).mockResolvedValueOnce(null);
    const res = await POST(
      new Request("http://localhost/api/noa/inv-1/ack", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: "bad" }),
      }),
      { params: Promise.resolve({ receivableId: "inv-1" }) },
    );
    expect(res.status).toBe(401);
  });

  it("acks when token matches confirmed receivable", async () => {
    vi.mocked(getConfirmationByToken).mockResolvedValueOnce({
      id: "c1",
      receivableId: "inv-1",
      payerId: "p1",
      status: "confirmed",
      authToken: "tok",
      confirmedAmount: 100,
      dueDate: "2026-01-01",
      confirmedAt: "2026-01-01T00:00:00.000Z",
      disputeReason: null,
      disputedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const res = await POST(
      new Request("http://localhost/api/noa/inv-1/ack", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: "tok", ackMethod: "in_app" }),
      }),
      { params: Promise.resolve({ receivableId: "inv-1" }) },
    );
    expect(res.status).toBe(200);
    expect(acknowledgeNoa).toHaveBeenCalledWith("inv-1", "in_app");
  });
});
