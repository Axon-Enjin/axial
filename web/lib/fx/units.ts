/** Circle USDC on Stellar uses 7 decimal places. */
export const USDC_STROOPS_PER_UNIT = 10_000_000;

/** Whole USDC units for Soroban i128 demos (not stroops). */
export function phpToUsdcWhole(phpAmount: number, phpPerUsdc: number): number {
  if (!Number.isFinite(phpAmount) || !Number.isFinite(phpPerUsdc) || phpPerUsdc <= 0) {
    return 0;
  }
  return Math.trunc(phpAmount / phpPerUsdc);
}

/** Convert whole USDC units to stroops for Horizon balance comparisons. */
export function usdcWholeToStroops(wholeUsdc: number): number {
  if (!Number.isFinite(wholeUsdc) || wholeUsdc <= 0) return 0;
  return Math.floor(wholeUsdc) * USDC_STROOPS_PER_UNIT;
}
