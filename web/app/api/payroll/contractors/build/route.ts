/**
 * POST /api/payroll/contractors/build
 * Freighter XDR for Testnet contractor_payroll::route_batch.
 */
import { NextResponse } from "next/server";
import {
  getContractorPayrollTestnetConfig,
  isContractorPayrollBuildEnabled,
} from "@/lib/soroban/config";
import { buildContractorBatchXdr } from "@/lib/soroban/build-tx";
import { quoteContractorBatch, type ContractorPayeeInput } from "@/lib/payroll/contractor-batch";

type Body = {
  batchId?: string;
  payees?: ContractorPayeeInput[];
  signerPublic?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const batchId = body.batchId?.trim();
  const signerPublic = body.signerPublic?.trim();
  if (!batchId) {
    return NextResponse.json({ error: "batchId is required" }, { status: 400 });
  }
  if (!signerPublic || signerPublic.length < 56) {
    return NextResponse.json(
      { error: "signerPublic (Freighter wallet) is required" },
      { status: 400 },
    );
  }

  let quote;
  try {
    quote = quoteContractorBatch(body.payees ?? []);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid payees";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const cfg = getContractorPayrollTestnetConfig();
  if (!isContractorPayrollBuildEnabled(cfg)) {
    return NextResponse.json(
      {
        error:
          "Contractor payroll Testnet contract not configured. Deploy contractor_payroll on Testnet and set TESTNET_CONTRACTOR_PAYROLL_CONTRACT_ID + TESTNET_SOROBAN_USDC_TOKEN_ID.",
        network: "testnet",
        quote,
      },
      { status: 503 },
    );
  }

  try {
    const xdr = await buildContractorBatchXdr(
      cfg,
      batchId,
      quote.payees.map((p) => p.wallet),
      quote.payees.map((p) => p.amountUsdc),
      signerPublic,
    );
    return NextResponse.json({
      xdr,
      batchId,
      quote,
      network: cfg.network,
      networkPassphrase: cfg.networkPassphrase,
      counselNote:
        "Independent contractors only. Do not use this path for regular employees.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Build failed";
    console.error("[payroll/contractors/build]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}