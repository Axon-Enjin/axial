import { enqueueEisProcessing } from "./oracle";
import type { ChainLedgerEvent, LedgerEventKind } from "./types";

export function triggerEisFromChain(
  kind: LedgerEventKind,
  referenceId: string,
  stellarTxHash: string,
  amount: number,
  advanceAmount?: number,
) {
  if (!stellarTxHash) return;

  const event: ChainLedgerEvent = {
    kind,
    referenceId,
    stellarTxHash,
    amount: advanceAmount ?? amount,
  };

  enqueueEisProcessing(event);
}
