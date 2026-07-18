import { NextResponse } from "next/server";
import { assertSessionAccess } from "@/lib/auth/session-gate";
import { fetchDemoWalletBalances } from "@/lib/soroban/balances";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await assertSessionAccess("read");
  if (gate.denied) return gate.denied;

  try {
    const data = await fetchDemoWalletBalances(await resolveSorobanConfig());
    return NextResponse.json({
      ...data,
      faucets:
        data.network !== "mainnet"
          ? {
              xlm: "https://friendbot.stellar.org",
              usdc: "https://faucet.circle.com/",
            }
          : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Balance fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
