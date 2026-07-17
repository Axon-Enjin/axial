/** Track A — independent contractors only (not Art. 102 employees). */

export const MAX_CONTRACTOR_PAYEES = 25;

export type ContractorPayeeInput = {
  wallet: string;
  amountUsdc: number;
};

export type ContractorBatchQuote = {
  payeeCount: number;
  totalUsdc: number;
  payees: ContractorPayeeInput[];
};

export function quoteContractorBatch(
  payees: ContractorPayeeInput[],
): ContractorBatchQuote {
  if (payees.length === 0) {
    throw new Error("Add at least one contractor payee");
  }
  if (payees.length > MAX_CONTRACTOR_PAYEES) {
    throw new Error(`At most ${MAX_CONTRACTOR_PAYEES} payees per batch`);
  }
  const normalized: ContractorPayeeInput[] = [];
  let total = 0;
  for (const p of payees) {
    const wallet = p.wallet?.trim() ?? "";
    if (wallet.length < 56) {
      throw new Error("Each payee needs a valid Stellar public key");
    }
    const amountUsdc = Math.trunc(p.amountUsdc);
    if (!Number.isFinite(amountUsdc) || amountUsdc <= 0) {
      throw new Error("Each payee amount must be a positive whole USDC amount");
    }
    normalized.push({ wallet, amountUsdc });
    total += amountUsdc;
  }
  return { payeeCount: normalized.length, totalUsdc: total, payees: normalized };
}
