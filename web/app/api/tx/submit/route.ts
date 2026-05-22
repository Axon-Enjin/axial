/**
 * POST /api/tx/submit
 *
 * Submits a Freighter-signed Stellar transaction XDR to the network.
 * Used by all Freighter self-custody flows (payroll, and future mint/swap).
 *
 * The client signs the unsigned XDR returned from /api/[type]/build with the
 * Freighter extension, then POSTs the signed envelope here.
 */
import { NextResponse } from "next/server";
import { rpc, TransactionBuilder } from "@stellar/stellar-sdk";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";

type Body = {
  /** Base64 signed transaction envelope XDR (from Freighter signTransaction). */
  xdr?: string;
  /** Optional: context label for logging ("payroll", "mint", "swap"). */
  context?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const signedXdr = body.xdr?.trim();
  if (!signedXdr) {
    return NextResponse.json({ error: "xdr (signed transaction envelope) is required" }, { status: 400 });
  }

  const cfg = await resolveSorobanConfig();
  const server = new rpc.Server(cfg.rpcUrl);

  let tx;
  try {
    tx = TransactionBuilder.fromXDR(signedXdr, cfg.networkPassphrase);
  } catch (parseErr) {
    const msg = parseErr instanceof Error ? parseErr.message : "Invalid XDR";
    return NextResponse.json({ error: `Failed to parse signed XDR: ${msg}` }, { status: 400 });
  }

  try {
    const result = await server.sendTransaction(tx);

    if (result.status === "ERROR") {
      const xdrError = result.errorResult?.toXDR("base64") ?? "unknown error";
      return NextResponse.json(
        { error: `Transaction rejected by network: ${xdrError}` },
        { status: 409 },
      );
    }

    const context = body.context ?? "unknown";
    console.info(`[tx/submit] context=${context} hash=${result.hash} status=${result.status}`);

    return NextResponse.json({
      txHash: result.hash,
      status: result.status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Submit failed";
    console.error("[tx/submit]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
