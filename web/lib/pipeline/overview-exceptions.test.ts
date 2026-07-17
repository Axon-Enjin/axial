import { describe, expect, it } from "vitest";
import { rankOverviewExceptions } from "./overview-exceptions";

describe("rankOverviewExceptions", () => {
  it("returns empty when nothing needs attention", () => {
    expect(rankOverviewExceptions({})).toEqual([]);
  });

  it("surfaces a single primary exception with a total count available", () => {
    const ranked = rankOverviewExceptions({
      orgFrozen: true,
      eisFailed: 2,
      funderAtRisk: 1,
      disputedCount: 1,
    });
    expect(ranked).toHaveLength(4);
    expect(ranked[0]?.id).toBe("org_frozen");
    expect(ranked[1]?.id).toBe("eis_failed");
  });
});
