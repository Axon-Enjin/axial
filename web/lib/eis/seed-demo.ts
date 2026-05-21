import { processLedgerEvent } from "./oracle";
import type { ChainLedgerEvent, EisSubmission } from "./types";

/** Demo ledger events for empty Supabase / first-load Compliance UI. */
const DEMO_EVENTS: ChainLedgerEvent[] = [
  {
    kind: "receivable_minted",
    referenceId: "INV-2023-8901",
    stellarTxHash: "seed-demo-mint-8901",
    amount: 125_000,
  },
  {
    kind: "swap_executed",
    referenceId: "INV-2023-8901",
    stellarTxHash: "seed-demo-swap-8901",
    amount: 125_000,
    advanceAmount: 106_250,
  },
  {
    kind: "payroll_routed",
    referenceId: "PAY-2026-05-19",
    stellarTxHash: "seed-demo-payroll-0519",
    amount: 1_250_000,
  },
];

export async function seedDemoEisSubmissions(): Promise<EisSubmission[]> {
  const results: EisSubmission[] = [];
  for (const event of DEMO_EVENTS) {
    results.push(await processLedgerEvent(event));
  }
  return results;
}
