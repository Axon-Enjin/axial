import { NextResponse } from "next/server";
import { assertSessionAccess } from "@/lib/auth/session-gate";
import { checkFundingEligibility } from "@/lib/payers/eligibility";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/invoices/:id/eligibility
 * The single-source funding gate (CLS-05).
 * Returns { fundable, blockers, ... } — never throws.
 */
export async function GET(_req: Request, context: RouteContext) {
  const gate = await assertSessionAccess("read");
  if (gate.denied) return gate.denied;

  const { id } = await context.params;
  const decoded = decodeURIComponent(id);

  try {
    const result = await checkFundingEligibility(decoded, gate.user?.orgId);
    const status = result.fundable ? 200 : 422;
    return NextResponse.json(result, { status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eligibility check failed";
    return NextResponse.json(
      { fundable: false, blockers: ["payer_not_found"], error: message },
      { status: 502 },
    );
  }
}
