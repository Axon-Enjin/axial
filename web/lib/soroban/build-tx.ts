/**
 * Server-side unsigned transaction builders for the Freighter self-custody path.
 *
 * Each function:
 * 1. Builds the Soroban transaction with the given signer as the source account.
 * 2. Simulates it via the Stellar RPC to populate the footprint and auth entries.
 *    When the signer IS the contract's required-auth principal, Soroban uses
 *    "invoker auth" — the outer transaction signature satisfies the contract auth.
 *    No separate auth entry signing is required.
 * 3. Returns the prepared unsigned XDR (base64 envelope).
 *
 * The client then signs this XDR with Freighter and POSTs it to /api/tx/submit.
 */

import {
  Address,
  Contract,
  nativeToScVal,
  rpc,
  Transaction,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import type { SorobanConfig } from "./config";

/** Shared simulate-and-prepare helper. Returns unsigned prepared XDR. */
async function simulateAndPrepareXdr(
  cfg: SorobanConfig,
  sourcePublic: string,
  contractId: string,
  method: string,
  args: ReturnType<typeof nativeToScVal>[],
): Promise<string> {
  const server = new rpc.Server(cfg.rpcUrl);

  let account;
  try {
    account = await server.getAccount(sourcePublic);
  } catch {
    const fundHint =
      cfg.network === "mainnet"
        ? "Fund it with XLM on Mainnet before signing."
        : `Fund it with XLM via https://friendbot.stellar.org/?addr=${sourcePublic}`;
    throw new Error(
      `Account ${sourcePublic.slice(0, 8)}… not found on ${cfg.network}. ${fundHint}`,
    );
  }

  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, {
    fee: "300000",
    networkPassphrase: cfg.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(180)
    .build();

  const simulation = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulation)) {
    const msg = simulation.error;
    if (msg.includes("Error(Contract, #4)")) {
      throw new Error("This operation was already processed on chain (duplicate id).");
    }
    if (msg.includes("Error(Contract, #1)")) {
      throw new Error("Contract is not initialized on this deployment.");
    }
    throw new Error(msg.length > 300 ? `${msg.slice(0, 300)}…` : msg);
  }

  const prepared = await server.prepareTransaction(tx);
  return (prepared as Transaction).toXDR();
}

/**
 * Build an unsigned `route_payroll` transaction for Freighter signing.
 *
 * The Freighter user's `signerPublic` is BOTH the transaction source AND the
 * `msme` parameter. Soroban's invoker-auth model means the outer tx signature
 * from Freighter satisfies `msme.require_auth()` with no separate entry.
 */
export async function buildPayrollXdr(
  cfg: SorobanConfig,
  payrollId: string,
  grossAmount: number,
  signerPublic: string,
): Promise<string> {
  if (!cfg.payrollContractId) {
    throw new Error("Payroll contract not configured (PAYROLL_SPLIT_CONTRACT_ID missing).");
  }
  return simulateAndPrepareXdr(cfg, signerPublic, cfg.payrollContractId, "route_payroll", [
    new Address(signerPublic).toScVal(),
    nativeToScVal(payrollId, { type: "string" }),
    nativeToScVal(BigInt(Math.trunc(grossAmount)), { type: "i128" }),
  ]);
}

/**
 * Build an unsigned `mint` transaction.
 * The issuer (server key) is the source and must sign server-side AFTER this
 * function is used — this variant is exposed for completeness but the
 * custodial path in invoke-receivable.ts is preferred for mint.
 */
/**
 * Build an unsigned USDC SAC `transfer` for payer Freighter signing.
 * Sends USDC from the payer to the settlement contract lockbox address.
 */
export async function buildLockboxFundXdr(
  cfg: SorobanConfig,
  payerPublic: string,
  amount: number,
): Promise<string> {
  if (!cfg.usdcTokenId || !cfg.settlementContractId) {
    throw new Error(
      "Lockbox funding not configured (usdcTokenId or settlementContractId missing).",
    );
  }
  return simulateAndPrepareXdr(cfg, payerPublic, cfg.usdcTokenId, "transfer", [
    new Address(payerPublic).toScVal(),
    new Address(cfg.settlementContractId).toScVal(),
    nativeToScVal(BigInt(Math.trunc(amount)), { type: "i128" }),
  ]);
}

export async function buildMintXdr(
  cfg: SorobanConfig,
  invoiceId: string,
  faceAmount: number,
  issuerPublic: string,
  msmePublic: string,
): Promise<string> {
  if (!cfg.receivableContractId) {
    throw new Error("Receivable contract not configured.");
  }
  return simulateAndPrepareXdr(cfg, issuerPublic, cfg.receivableContractId, "mint", [
    new Address(issuerPublic).toScVal(),
    new Address(msmePublic).toScVal(),
    nativeToScVal(invoiceId, { type: "string" }),
    nativeToScVal(BigInt(Math.trunc(faceAmount)), { type: "i128" }),
  ]);
}
