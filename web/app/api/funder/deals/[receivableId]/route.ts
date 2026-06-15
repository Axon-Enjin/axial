import { NextResponse } from "next/server";
import { getFunderDeal } from "@/lib/funder/book";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ receivableId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { receivableId } = await context.params;
  const decoded = decodeURIComponent(receivableId);

  try {
    const cfg = await resolveSorobanConfig();
    const deal = await getFunderDeal(decoded, cfg.funderPublic);
    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }
    return NextResponse.json({ deal, network: cfg.network });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Get deal failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
