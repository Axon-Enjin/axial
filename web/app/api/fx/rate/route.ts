/**
 * GET /api/fx/rate
 *
 * Returns the current PHP/USDC FX rate from the Reflector oracle,
 * with a 5-minute server-side cache. Falls back to the hardcoded
 * demo rate (56.5) if the oracle is unreachable or the PHP asset
 * is not supported on the current network.
 *
 * Response:
 *   { phpPerUsdc: number, source: "reflector" | "fallback",
 *     contractId: string | null, cachedAt: string | null, error: string | null }
 *
 * POST /api/fx/rate?action=invalidate
 *   Force-invalidates the in-process cache for testing.
 */
import { NextResponse } from "next/server";
import { getSorobanConfig } from "@/lib/soroban/config";
import { getPhpPerUsdc, invalidateRateCache } from "@/lib/fx/reflector";

export async function GET() {
  const cfg = getSorobanConfig();
  try {
    const rate = await getPhpPerUsdc({
      rpcUrl: cfg.rpcUrl,
      networkPassphrase: cfg.networkPassphrase,
      network: cfg.network,
    });
    return NextResponse.json(rate, {
      headers: {
        // Allow CDN/browser caching for 2 minutes (server caches for 5min)
        "Cache-Control": "public, max-age=120, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Rate fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("action") === "invalidate") {
    invalidateRateCache();
    return NextResponse.json({ ok: true, message: "Rate cache invalidated" });
  }
  return NextResponse.json({ error: "Use ?action=invalidate" }, { status: 400 });
}
