/**
 * Track B — employer funds in USDC; employees receive PHP legal tender via a
 * licensed edge. Live partner deferred (PDAX/SEP-24 when access lands).
 */

export type FiatOfframpQuote = {
  usdcIn: number;
  phpOut: number;
  phpPerUsdc: number;
  expiresAt: string;
  source: "mock" | "pdax" | "vasp";
};

export type FiatPayoutStatus = "queued" | "processing" | "paid" | "failed";

export type FiatPayout = {
  id: string;
  employeeRef: string;
  phpAmount: number;
  usdcIn: number;
  status: FiatPayoutStatus;
  createdAt: string;
  updatedAt: string;
  error?: string;
};

export type FiatOfframp = {
  quoteUsdcToPhp(usdcIn: number): Promise<FiatOfframpQuote>;
  createPayout(input: {
    employeeRef: string;
    usdcIn: number;
    bankRef?: string;
  }): Promise<FiatPayout>;
  getPayoutStatus(id: string): Promise<FiatPayout | null>;
};

const MOCK_RATE = 56.5;

/** Demo adapter — no live VASP calls. */
export function createMockFiatOfframp(): FiatOfframp {
  const payouts = new Map<string, FiatPayout>();

  return {
    async quoteUsdcToPhp(usdcIn: number) {
      const whole = Math.max(0, Math.trunc(usdcIn));
      return {
        usdcIn: whole,
        phpOut: Math.round(whole * MOCK_RATE),
        phpPerUsdc: MOCK_RATE,
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        source: "mock",
      };
    },
    async createPayout(input) {
      const quote = await this.quoteUsdcToPhp(input.usdcIn);
      const now = new Date().toISOString();
      const payout: FiatPayout = {
        id: `payout_${Date.now().toString(36)}`,
        employeeRef: input.employeeRef,
        phpAmount: quote.phpOut,
        usdcIn: quote.usdcIn,
        status: "queued",
        createdAt: now,
        updatedAt: now,
      };
      payouts.set(payout.id, payout);
      return payout;
    },
    async getPayoutStatus(id) {
      return payouts.get(id) ?? null;
    },
  };
}

export function getFiatOfframp(): FiatOfframp {
  return createMockFiatOfframp();
}
