/** Matches `axial_swap::quote` — 8500 bps = 85% advance. */
export const DEFAULT_ADVANCE_BPS = 8_500;
const MAX_BPS = 10_000;

export function quoteAdvance(faceAmount: number, advanceBps = DEFAULT_ADVANCE_BPS) {
  if (faceAmount <= 0) {
    throw new Error("face amount must be positive");
  }
  const advance = Math.floor((faceAmount * advanceBps) / MAX_BPS);
  const reserve = faceAmount - advance;
  return { advance, reserve, advanceBps };
}

/** Format stroops (7 decimals) for USDC display. */
export function formatUsdcStroops(stroops: number, decimals = 7): string {
  const factor = 10 ** decimals;
  const whole = stroops / factor;
  return whole.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
