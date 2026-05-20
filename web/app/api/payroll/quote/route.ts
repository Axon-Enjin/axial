import { NextResponse } from "next/server";
import { quotePayrollSplit } from "@/lib/soroban/payroll-quote";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gross = Number(searchParams.get("gross"));

  if (!Number.isFinite(gross) || gross <= 0) {
    return NextResponse.json(
      { error: "gross must be a positive number" },
      { status: 400 },
    );
  }

  const quote = quotePayrollSplit(gross);
  return NextResponse.json({
    gross: quote.gross,
    sss: quote.sss,
    philhealth: quote.philhealth,
    pagibig: quote.pagibig,
    net: quote.net,
    sssBps: quote.sssBps,
    philhealthBps: quote.philhealthBps,
    pagibigBps: quote.pagibigBps,
  });
}
