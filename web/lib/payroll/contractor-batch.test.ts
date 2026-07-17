import { describe, expect, it } from "vitest";
import { quoteContractorBatch } from "./contractor-batch";

describe("quoteContractorBatch", () => {
  it("sums valid contractor payees", () => {
    const q = quoteContractorBatch([
      {
        wallet: "G".padEnd(56, "A"),
        amountUsdc: 100,
      },
      {
        wallet: "G".padEnd(56, "B"),
        amountUsdc: 50,
      },
    ]);
    expect(q.totalUsdc).toBe(150);
    expect(q.payeeCount).toBe(2);
  });

  it("rejects empty and non-positive amounts", () => {
    expect(() => quoteContractorBatch([])).toThrow(/at least one/i);
    expect(() =>
      quoteContractorBatch([{ wallet: "G".padEnd(56, "A"), amountUsdc: 0 }]),
    ).toThrow(/positive/i);
  });
});
