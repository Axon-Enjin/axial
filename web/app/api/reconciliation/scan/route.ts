import { NextResponse } from "next/server";
import { listInvoices, markCollectedInvoice } from "@/lib/invoices/store";
import { getReserveEntry, listOpenEntries, markEntryLeaked } from "@/lib/settlement/store";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";
import { isSettlementChainEnabled, reportLeakageOnChain } from "@/lib/soroban/invoke-settlement";
import type { ReconciliationResult } from "@/lib/settlement/types";

// T+X = 7 calendar days after due date before leakage is reported
const LEAKAGE_GRACE_DAYS = 7;

/**
 * POST /api/reconciliation/scan
 *
 * Idempotent leakage scanner (CLS-09). Should be called by a cron job or
 * manually for debugging. Scans all open reserve-ledger entries:
 *
 * 1. If the invoice's on-chain lockbox has been funded (collectionStatus=collected
 *    in the factoring invoices table) → nothing to do.
 * 2. If due_date + LEAKAGE_GRACE_DAYS has passed and no payment → mark leaked.
 *    - Transitions reserve_ledger.recourse_status = 'triggered'
 *    - Calls settlement::report_leakage on-chain if contract is configured
 *    - Does NOT automatically freeze the MSME (that requires auth UX — future B-6)
 *
 * The scanner never touches settled or already-leaked entries.
 */
export async function POST() {
  const result: ReconciliationResult = {
    scanned: 0,
    settled: 0,
    leaked: [],
    errors: [],
  };

  const cfg = await resolveSorobanConfig();
  const now = new Date();

  try {
    const entries = await listOpenEntries();
    result.scanned = entries.length;

    await Promise.allSettled(
      entries.map(async (entry) => {
        try {
          // Fast-path: invoice already marked collected in the factoring table
          const reserveEntry = await getReserveEntry(entry.receivableId);
          if (!reserveEntry) return;

          // Check the corresponding factoring invoice collection status
          const { items } = await listInvoices(1, 1000);
          const invoice = items.find((i) => i.id === entry.receivableId);

          if (invoice?.collectionStatus === "collected") {
            // Payment confirmed off-chain (mark_collected was called) — nothing to leak
            result.settled += 1;
            return;
          }

          // Check for leakage: past grace period with no collection
          if (!entry.dueDate) return;

          const dueDate = new Date(entry.dueDate);
          const cutoff = new Date(dueDate);
          cutoff.setDate(cutoff.getDate() + LEAKAGE_GRACE_DAYS);

          if (now > cutoff) {
            // Leakage confirmed
            await markEntryLeaked(entry.receivableId);

            // Report on-chain if settlement contract is available
            if (isSettlementChainEnabled(cfg)) {
              try {
                await reportLeakageOnChain(cfg, entry.receivableId);
              } catch (chainErr) {
                // Non-fatal — off-chain record is the source of truth for now
                result.errors.push(
                  `Chain report_leakage failed for ${entry.receivableId}: ${
                    chainErr instanceof Error ? chainErr.message : String(chainErr)
                  }`,
                );
              }
            }

            result.leaked.push(entry.receivableId);
          }
        } catch (entryErr) {
          result.errors.push(
            `Error processing ${entry.receivableId}: ${
              entryErr instanceof Error ? entryErr.message : String(entryErr)
            }`,
          );
        }
      }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const status = result.errors.length > 0 ? 207 : 200;
  return NextResponse.json(result, { status });
}
