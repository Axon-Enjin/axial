import { NextResponse } from "next/server";
import { fetchDemoWalletBalances } from "@/lib/soroban/balances";
import { getInvoiceStoreBackend, listInvoices } from "@/lib/invoices/store";
import { getEisStoreBackend, listSubmissions } from "@/lib/eis/store";
import { listFunderBook } from "@/lib/funder/book";
import {
  resolvePublicChainStatus,
  resolveSorobanConfig,
} from "@/lib/soroban/server-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const chain = await resolvePublicChainStatus();
    const { items, total } = await listInvoices(1, 500);
    const totalFacePhp = items.reduce((sum, inv) => sum + inv.face, 0);
    const fundableCount = items.filter((i) => i.status === "fundable").length;
    const settledCount = items.filter((i) => i.status === "settled").length;
    const collectedCount = items.filter((i) => i.collectionStatus === "collected").length;
    const pendingPayerCount = items.filter((i) => i.status === "awaiting_payer").length;

    let treasury: {
      funderUsdc: string | null;
      msmeUsdc: string | null;
      funderXlm: string | null;
      stale?: boolean;
    } = {
      funderUsdc: null,
      msmeUsdc: null,
      funderXlm: null,
    };
    try {
      const balances = await fetchDemoWalletBalances(await resolveSorobanConfig());
      const funder = balances.wallets.find((w) => w.role === "funder");
      const msme = balances.wallets.find((w) => w.role === "msme");
      treasury = {
        funderUsdc: funder?.usdc ?? null,
        msmeUsdc: msme?.usdc ?? null,
        funderXlm: funder?.xlm ?? null,
      };
    } catch {
      treasury = { funderUsdc: null, msmeUsdc: null, funderXlm: null, stale: true };
    }

    const eisRows = await listSubmissions(50);
    const eisSynchronized = eisRows.filter(
      (r) => r.status === "acknowledged" || r.status === "memo_written",
    ).length;
    const payrollRouted = eisRows.filter((r) => r.eventKind === "payroll_routed").length;

    let funderAtRisk = 0;
    let funderRepaid = 0;
    try {
      const book = await listFunderBook(1, 500);
      funderAtRisk = book.summary.atRisk;
      funderRepaid = book.summary.repaid;
    } catch {
      // Non-fatal — overview still renders without funder aggregates
    }

    const contractsLive = [
      chain.swapContractId,
      chain.receivableContractId,
      chain.payrollContractId,
    ].filter(Boolean).length;

    return NextResponse.json({
      network: chain.network,
      invoiceStore: getInvoiceStoreBackend(),
      eisStore: getEisStoreBackend(),
      book: {
        totalInvoices: total,
        totalFacePhp,
        fundableCount,
        settledCount,
        collectedCount,
        pendingPayerCount,
      },
      treasury,
      eis: {
        total: eisRows.length,
        synchronized: eisSynchronized,
      },
      payroll: {
        routed: payrollRouted,
      },
      funder: {
        atRisk: funderAtRisk,
        repaid: funderRepaid,
      },
      contractsDeployed: contractsLive,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Summary failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
