import { describe, expect, it } from "vitest";
import { phpToUsdcWhole, usdcWholeToStroops, USDC_STROOPS_PER_UNIT } from "./convert";

describe("phpToUsdcWhole", () => {
  it("converts PHP face to whole USDC units", () => {
    expect(phpToUsdcWhole(56500, 56.5)).toBe(1000);
    expect(phpToUsdcWhole(125_000, 56.5)).toBe(2212);
  });

  it("rejects non-finite or non-positive rates", () => {
    expect(phpToUsdcWhole(100, 0)).toBe(0);
    expect(phpToUsdcWhole(100, -1)).toBe(0);
    expect(phpToUsdcWhole(Number.NaN, 56.5)).toBe(0);
    expect(phpToUsdcWhole(100, Number.NaN)).toBe(0);
  });
});

describe("usdcWholeToStroops", () => {
  it("scales whole USDC to 7-decimal stroops", () => {
    expect(usdcWholeToStroops(85)).toBe(85 * USDC_STROOPS_PER_UNIT);
    expect(usdcWholeToStroops(1)).toBe(10_000_000);
  });

  it("rejects non-positive amounts", () => {
    expect(usdcWholeToStroops(0)).toBe(0);
    expect(usdcWholeToStroops(-1)).toBe(0);
  });
});
