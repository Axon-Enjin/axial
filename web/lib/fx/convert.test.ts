import { describe, expect, it } from "vitest";
import { phpToUsdcWhole } from "./convert";

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
