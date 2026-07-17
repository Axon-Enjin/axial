/**
 * POST /api/payroll/build
 *
 * Builds an unsigned, prepared payroll transaction XDR for the Freighter
 * self-custody signing path. The client signs the returned XDR with their
 * Freighter wallet and submits via POST /api/tx/submit.
 *
 * The signer's public key is used as BOTH the transaction source AND the
 * `msme` contract parameter — Soroban's invoker-auth model means the single
 * Freighter signature satisfies both the fee payment and the contract's
 * require_auth() check.
 */
import { NextResponse } from "next/server";
import { isPayrollBuildEnabled } from "@/lib/soroban/config";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";
import { buildPayrollXdr } from "@/lib/soroban/build-tx";
import { quotePayrollSplit } from "@/lib/soroban/payroll-quote";
import { assertPayrollPreflight } from "@/lib/soroban/usdc-preflight";

type Body = {
  payrollId?: string;
  grossAmount?: number;
  /** Freighter wallet public key — becomes the transaction source and msme param. */
  signerPublic?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payrollId = body.payrollId?.trim();
  const grossAmount = body.grossAmount;
  const signerPublic = body.signerPublic?.trim();

  if (!payrollId) {
    return NextResponse.json({ error: "payrollId is required" }, { status: 400 });
  }
  if (!Number.isFinite(grossAmount) || (grossAmount ?? 0) <= 0) {
    return NextResponse.json(
      { error: "grossAmount must be a positive number" },
      { status: 400 },
    );
  }
  if (!signerPublic || signerPublic.length < 56) {
    return NextResponse.json(
      { error: "signerPublic (Freighter wallet public key) is required" },
      { status: 400 },
    );
  }

  const cfg = await resolveSorobanConfig();
  if (!isPayrollBuildEnabled(cfg)) {
    return NextResponse.json(
      {
        error:
          "Payroll contract not configured. Set PAYROLL_SPLIT_CONTRACT_ID in .env.local.",
      },
      { status: 503 },
    );
  }

  try {
    const preflight = await assertPayrollPreflight(cfg, signerPublic, grossAmount!);
    if (!preflight.ok) {
      return NextResponse.json(
        { error: preflight.message, code: preflight.code },
        { status: 409 },
      );
    }

    const xdr = await buildPayrollXdr(cfg, payrollId, grossAmount!, signerPublic);
    const quote = quotePayrollSplit(grossAmount!);
    return NextResponse.json({
      xdr,
      payrollId,
      grossAmount,
      networkPassphrase: cfg.networkPassphrase,
      network: cfg.network,
      quote,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Build failed";
    console.error("[payroll/build]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
