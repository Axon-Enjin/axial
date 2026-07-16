import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const upsertSubmission = vi.fn(async (sub: unknown) => sub);
const findByIdempotencyKey = vi.fn(async () => null);

vi.mock("./store", () => ({
  buildIdempotencyKey: (org: string, tx: string, ref: string) => `${org}:${tx}:${ref}`,
  findByIdempotencyKey: (...args: unknown[]) => findByIdempotencyKey(...args),
  newPayloadId: () => "payload-1",
  upsertSubmission: (...args: unknown[]) => upsertSubmission(...args),
}));

vi.mock("./bir-client", () => ({
  getBirEisClient: () => ({
    submit: vi.fn(async () => ({
      accepted: true,
      birReferenceId: "BIR-1",
      receivedAt: new Date().toISOString(),
    })),
  }),
}));

vi.mock("./jws", () => ({
  signEisPayload: () => "header.payload.sig",
}));

vi.mock("./memo", () => ({
  writeBirMemoToStellar: vi.fn(async () => ({
    memoTxHash: "memo-tx",
    memoText: "BIR-1",
  })),
}));

vi.mock("./schema", () => ({
  mapLedgerEventToEisPayload: vi.fn(async () => ({
    invoiceNumber: "INV-1",
    invoiceDate: "2026-07-01",
    sellerTin: "1",
    sellerName: "S",
    sellerAddress: "A",
    buyerTin: "2",
    buyerName: "B",
    buyerAddress: "C",
    description: "d",
    quantity: 1,
    unitOfMeasure: "EA",
    unitPrice: 100,
    grossAmount: 100,
    vatExemptAmount: 0,
    zeroRatedAmount: 0,
    taxableAmount: 100,
    vatAmount: 0,
    totalAmountDue: 100,
    transactionType: "sale",
    paymentMode: "usdc",
    stellarTxHash: "tx1",
    eventKind: "swap_executed",
  })),
}));

vi.mock("@/lib/notifications/emit", () => ({
  emitEisFailed: vi.fn(),
}));

vi.mock("@/lib/org/store", () => ({
  resolveOrgId: () => "demo-org",
}));

import { processLedgerEvent, submitPreparedSubmission } from "./oracle";
import type { EisSubmission } from "./types";

describe("EIS Co-Pilot prepare gate", () => {
  const prevSeed = process.env.AXIAL_ALLOW_SEED;
  const prevAuto = process.env.EIS_DEMO_AUTO_ACK;
  const prevLive = process.env.BIR_EIS_LIVE;

  beforeEach(() => {
    vi.clearAllMocks();
    findByIdempotencyKey.mockResolvedValue(null);
    upsertSubmission.mockImplementation(async (sub: unknown) => sub);
    delete process.env.AXIAL_ALLOW_SEED;
    delete process.env.EIS_DEMO_AUTO_ACK;
    process.env.BIR_EIS_LIVE = "false";
  });

  afterEach(() => {
    if (prevSeed === undefined) delete process.env.AXIAL_ALLOW_SEED;
    else process.env.AXIAL_ALLOW_SEED = prevSeed;
    if (prevAuto === undefined) delete process.env.EIS_DEMO_AUTO_ACK;
    else process.env.EIS_DEMO_AUTO_ACK = prevAuto;
    if (prevLive === undefined) delete process.env.BIR_EIS_LIVE;
    else process.env.BIR_EIS_LIVE = prevLive;
  });

  it("stops at prepared without BIR submit when auto-ack is off", async () => {
    const sub = await processLedgerEvent({
      kind: "swap_executed",
      referenceId: "ref-1",
      stellarTxHash: "tx-1",
      amount: 100,
    });
    expect(sub.status).toBe("prepared");
    expect(sub.dueBy).toBe("2026-07-04T00:00:00.000Z");
    expect(sub.birReferenceId).toBeNull();
  });

  it("idempotently returns existing prepared rows", async () => {
    const existing = {
      id: "e1",
      payloadId: "p1",
      idempotencyKey: "k",
      status: "prepared" as const,
      eventKind: "swap_executed" as const,
      referenceId: "ref-1",
      stellarTxHash: "tx-1",
      birReferenceId: null,
      memoTxHash: null,
      memoText: null,
      jwsCompact: "jws",
      payload: { invoiceDate: "2026-07-01" },
      createdAt: "2026-07-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
      dueBy: "2026-07-04T00:00:00.000Z",
    };
    findByIdempotencyKey.mockResolvedValueOnce(existing);
    const sub = await processLedgerEvent({
      kind: "swap_executed",
      referenceId: "ref-1",
      stellarTxHash: "tx-1",
      amount: 100,
    });
    expect(sub).toBe(existing);
    expect(upsertSubmission).not.toHaveBeenCalled();
  });

  it("submitPreparedSubmission advances prepared → acknowledged path", async () => {
    const prepared: EisSubmission = {
      id: "e1",
      payloadId: "p1",
      idempotencyKey: "k",
      status: "prepared",
      eventKind: "swap_executed",
      referenceId: "ref-1",
      stellarTxHash: "tx-1",
      birReferenceId: null,
      memoTxHash: null,
      memoText: null,
      jwsCompact: "jws",
      payload: {
        invoiceNumber: "INV-1",
        invoiceDate: "2026-07-01",
        sellerTin: "1",
        sellerName: "S",
        sellerAddress: "A",
        buyerTin: "2",
        buyerName: "B",
        buyerAddress: "C",
        description: "d",
        quantity: 1,
        unitOfMeasure: "EA",
        unitPrice: 100,
        grossAmount: 100,
        vatExemptAmount: 0,
        zeroRatedAmount: 0,
        taxableAmount: 100,
        vatAmount: 0,
        totalAmountDue: 100,
        transactionType: "sale",
        paymentMode: "usdc",
        stellarTxHash: "tx-1",
        eventKind: "swap_executed",
      },
      createdAt: "2026-07-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
      dueBy: "2026-07-04T00:00:00.000Z",
    };
    const result = await submitPreparedSubmission(prepared);
    expect(["acknowledged", "memo_written"]).toContain(result.status);
    expect(result.birReferenceId).toBe("BIR-1");
  });
});
