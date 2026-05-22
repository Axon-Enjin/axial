import { enqueueEisProcessing } from "./oracle";
import type { StellarNetworkId } from "@/lib/soroban/network";
import type { ChainLedgerEvent, LedgerEventKind } from "./types";

export function triggerEisFromChain(
  kind: LedgerEventKind,
  referenceId: string,
  stellarTxHash: string,
  amount: number,
  network: StellarNetworkId,
  advanceAmount?: number,
) {
  if (!stellarTxHash) return;

  const event: ChainLedgerEvent = {
    kind,
    referenceId,
    stellarTxHash,
    amount: advanceAmount ?? amount,
    network,
  };

  enqueueEisProcessing(event);
}
