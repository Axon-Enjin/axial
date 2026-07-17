export type OverviewException = {
  id: string;
  title: string;
  href: string;
  priority: number;
};

type Input = {
  orgFrozen?: boolean;
  eisFailed?: number;
  eisPending?: number;
  funderAtRisk?: number;
  disputedCount?: number;
};

/**
 * Rank calm exceptions for Overview. One punch-list, not a Christmas tree.
 */
export function rankOverviewExceptions(input: Input): OverviewException[] {
  const items: OverviewException[] = [];

  if (input.orgFrozen) {
    items.push({
      id: "org_frozen",
      title: "Funding paused — review collection liability",
      href: "/app/settings",
      priority: 0,
    });
  }
  if ((input.eisFailed ?? 0) > 0) {
    items.push({
      id: "eis_failed",
      title:
        input.eisFailed === 1
          ? "One EIS filing needs your review"
          : `${input.eisFailed} EIS filings need your review`,
      href: "/app/compliance",
      priority: 1,
    });
  } else if ((input.eisPending ?? 0) > 0) {
    items.push({
      id: "eis_pending",
      title:
        input.eisPending === 1
          ? "One filing is waiting for approval inside T+3"
          : `${input.eisPending} filings are waiting for approval inside T+3`,
      href: "/app/compliance",
      priority: 2,
    });
  }
  if ((input.funderAtRisk ?? 0) > 0) {
    items.push({
      id: "funder_risk",
      title:
        input.funderAtRisk === 1
          ? "One deal needs collection attention"
          : `${input.funderAtRisk} deals need collection attention`,
      href: "/app/liquidity#funder-book",
      priority: 3,
    });
  }
  if ((input.disputedCount ?? 0) > 0) {
    items.push({
      id: "disputed",
      title: "A payer dispute is blocking funding",
      href: "/app/liquidity",
      priority: 4,
    });
  }

  return items.sort((a, b) => a.priority - b.priority);
}
