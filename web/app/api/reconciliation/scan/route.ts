import { NextResponse } from "next/server";
import { getInvoice, listInvoices } from "@/lib/invoices/store";
import { freezeOrg } from "@/lib/org/store";
import { emitLeaked, emitOrgFrozen } from "@/lib/notifications/emit";
import { getReserveEntry, listOpenEntries, markEntryLeaked } from "@/lib/settlement/store";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";
import { isSettlementChainEnabled, reportLeakageOnChain } from "@/lib/soroban/invoke-settlement";
import type { ReconciliationResult } from "@/lib/settlement/types";

// T+X = 7 calendar days after due date before leakage is reported
const LEAKAGE_GRACE_DAYS = 7;

function assertCronAuth(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null;
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

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
 *    - Freezes org funding (MSME) and emits calm notifications
 *
 * The scanner never touches settled or already-leaked entries.
 */
export async function POST(request: Request) {
  const denied = assertCronAuth(request);
  if (denied) return denied;

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
                const invoice = await getInvoice(entry.receivableId);
                const chainId = invoice?.onChainInvoiceId ?? entry.receivableId;
                await reportLeakageOnChain(cfg, chainId);
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

            const orgId = process.env.AXIAL_ORG_ID ?? "demo-org";
            const reason = `Leakage on ${entry.receivableId.slice(0, 8)}… — new funding paused pending review.`;
            await freezeOrg(orgId, reason);
            emitLeaked(orgId, entry.receivableId, reserveEntry.shortfall);
            emitOrgFrozen(orgId, reason);
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
