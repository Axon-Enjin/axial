import { NextResponse } from "next/server";
import { quoteContractorBatch, type ContractorPayeeInput } from "@/lib/payroll/contractor-batch";

type Body = { payees?: ContractorPayeeInput[] };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  try {
    const quote = quoteContractorBatch(body.payees ?? []);
    return NextResponse.json({
      quote,
      counselNote:
        "Track A is for independent contractors only. Employees must receive PHP legal tender (Labor Code Art. 102) via Track B.",
      network: "testnet",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Quote failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
