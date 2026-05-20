import { NextResponse } from "next/server";
import { getSorobanConfig, isPayrollChainEnabled } from "@/lib/soroban/config";
import { routePayrollOnChain } from "@/lib/soroban/invoke-payroll";
import { quotePayrollSplit } from "@/lib/soroban/payroll-quote";

type Body = {
  payrollId?: string;
  grossAmount?: number;
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

  if (!payrollId) {
    return NextResponse.json({ error: "payrollId is required" }, { status: 400 });
  }
  if (!Number.isFinite(grossAmount) || (grossAmount ?? 0) <= 0) {
    return NextResponse.json(
      { error: "grossAmount must be a positive number" },
      { status: 400 },
    );
  }

  const cfg = getSorobanConfig();
  const quote = quotePayrollSplit(grossAmount!);

  if (!isPayrollChainEnabled(cfg)) {
    return NextResponse.json({
      mode: "demo",
      payrollId,
      grossAmount,
      ...quote,
      message:
        "Demo payroll split recorded. Deploy payroll_split, set PAYROLL_SPLIT_CONTRACT_ID and STELLAR_MSME_SECRET in web/.env.local.",
    });
  }

  try {
    const result = await routePayrollOnChain(cfg, payrollId, grossAmount!);
    return NextResponse.json({
      mode: "on-chain",
      payrollId,
      grossAmount,
      sss: quote.sss,
      philhealth: quote.philhealth,
      pagibig: quote.pagibig,
      net: quote.net,
      txHash: result.txHash,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payroll route failed";
    const status = message.includes("already routed") ? 409 : 502;
    console.error("[payroll/route]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
