export type InvoiceStatus = "awaiting_payer" | "fundable" | "settled";

export type CollectionStatus = "awaiting_payer" | "open" | "settling" | "collected";

export type FactoringInvoice = {
  id: string;
  party: string;
  terms: string;
  face: number;
  /** USDC whole units for chain (PHP face converted); null until first FX resolve. */
  faceUsdc: number | null;
  /** Sum of lockbox fund builds attributed to this invoice (whole USDC). */
  attributedInflowUsdc: number | null;
  immediate: number | null;
  status: InvoiceStatus;
  payerConfirmed: boolean;
  noaAcknowledged: boolean;
  lockboxAddress: string | null;
  lockboxMemo: string | null;
  collectionStatus: CollectionStatus;
  mintTxHash: string | null;
  swapTxHash: string | null;
  /** Soroban invoice id used in register_invoice / settle (may differ from row id). */
  onChainInvoiceId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FactoringInvoiceClient = FactoringInvoice & {
  trust: {
    payerConfirmed: boolean;
    noaAcknowledged: boolean;
    lockboxAddress: string | null;
    lockboxMemo: string | null;
    collectionStatus: CollectionStatus;
  };
};

export function toClientInvoice(inv: FactoringInvoice): FactoringInvoiceClient {
  return {
    ...inv,
    trust: {
      payerConfirmed: inv.payerConfirmed,
      noaAcknowledged: inv.noaAcknowledged,
      lockboxAddress: inv.lockboxAddress,
      lockboxMemo: inv.lockboxMemo,
      collectionStatus: inv.collectionStatus,
    },
  };
}
