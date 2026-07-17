import { describe, expect, it } from "vitest";
import { createMockFiatOfframp } from "./fiat-offramp";

describe("mock FiatOfframp", () => {
  it("quotes USDC to PHP and creates a queued payout", async () => {
    const rail = createMockFiatOfframp();
    const quote = await rail.quoteUsdcToPhp(100);
    expect(quote.phpOut).toBe(5650);
    expect(quote.source).toBe("mock");

    const payout = await rail.createPayout({
      employeeRef: "emp-1",
      usdcIn: 100,
    });
    expect(payout.status).toBe("queued");
    expect(payout.phpAmount).toBe(5650);

    const again = await rail.getPayoutStatus(payout.id);
    expect(again?.id).toBe(payout.id);
  });
});
