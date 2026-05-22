import {
  Address,
  Contract,
  Keypair,
  nativeToScVal,
  rpc,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import type { SorobanConfig } from "./config";

export type SettlementResult = {
  txHash: string;
  status: "submitted";
};

export function isSettlementChainEnabled(cfg: SorobanConfig): boolean {
  return Boolean(
    cfg.settlementContractId &&
      cfg.funderSecret &&
      cfg.funderPublic &&
      cfg.msmePublic,
  );
}

function buildAndSubmit(
  server: rpc.Server,
  account: Awaited<ReturnType<typeof server.getAccount>>,
  contract: Contract,
  networkPassphrase: string,
  method: string,
  args: ReturnType<typeof nativeToScVal>[],
  signer: Keypair,
): Promise<SettlementResult> {
  const tx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(180)
    .build();

  return server
    .simulateTransaction(tx)
    .then((simulation) => {
      if (rpc.Api.isSimulationError(simulation)) {
        throw new Error(
          simulation.error.length > 200
            ? `${simulation.error.slice(0, 200)}…`
            : simulation.error,
        );
      }
      return server.prepareTransaction(tx);
    })
    .then((prepared) => {
      prepared.sign(signer);
      return server.sendTransaction(prepared);
    })
    .then((send) => {
      if (send.status === "ERROR") {
        throw new Error(send.errorResult?.toXDR("base64") ?? "transaction failed");
      }
      return { txHash: send.hash, status: "submitted" as const };
    });
}

/**
 * Calls settlement::register_invoice after axial_swap::execute_advance.
 * Records the lockbox terms so the settlement contract can distribute later.
 */
export async function registerInvoiceOnChain(
  cfg: SorobanConfig,
  invoiceId: string,
  faceAmount: number,
  advanceAmount: number,
): Promise<SettlementResult> {
  if (
    !cfg.settlementContractId ||
    !cfg.funderSecret ||
    !cfg.funderPublic ||
    !cfg.msmePublic
  ) {
    throw new Error("Settlement contract env is not configured");
  }

  const server = new rpc.Server(cfg.rpcUrl);
  const admin = Keypair.fromSecret(cfg.funderSecret); // admin = funder key for demo
  const account = await server.getAccount(admin.publicKey());
  const contract = new Contract(cfg.settlementContractId);

  return buildAndSubmit(
    server,
    account,
    contract,
    cfg.networkPassphrase,
    "register_invoice",
    [
      new Address(admin.publicKey()).toScVal(),
      nativeToScVal(invoiceId, { type: "string" }),
      new Address(cfg.funderPublic).toScVal(),
      new Address(cfg.msmePublic).toScVal(),
      nativeToScVal(BigInt(Math.trunc(faceAmount)), { type: "i128" }),
      nativeToScVal(BigInt(Math.trunc(advanceAmount)), { type: "i128" }),
    ],
    admin,
  );
}

/**
 * Calls settlement::settle — distributes USDC from the lockbox to funder + MSME.
 * `collectedAmount` must equal what was already transferred to the contract address.
 */
export async function settleOnChain(
  cfg: SorobanConfig,
  invoiceId: string,
  collectedAmount: number,
): Promise<SettlementResult> {
  if (!cfg.settlementContractId || !cfg.funderSecret) {
    throw new Error("Settlement contract env is not configured");
  }

  const server = new rpc.Server(cfg.rpcUrl);
  const admin = Keypair.fromSecret(cfg.funderSecret);
  const account = await server.getAccount(admin.publicKey());
  const contract = new Contract(cfg.settlementContractId);

  return buildAndSubmit(
    server,
    account,
    contract,
    cfg.networkPassphrase,
    "settle",
    [
      new Address(admin.publicKey()).toScVal(),
      nativeToScVal(invoiceId, { type: "string" }),
      nativeToScVal(BigInt(Math.trunc(collectedAmount)), { type: "i128" }),
    ],
    admin,
  );
}

/**
 * Calls settlement::report_leakage — transitions the on-chain record to Leaked.
 */
export async function reportLeakageOnChain(
  cfg: SorobanConfig,
  invoiceId: string,
): Promise<SettlementResult> {
  if (!cfg.settlementContractId || !cfg.funderSecret) {
    throw new Error("Settlement contract env is not configured");
  }

  const server = new rpc.Server(cfg.rpcUrl);
  const admin = Keypair.fromSecret(cfg.funderSecret);
  const account = await server.getAccount(admin.publicKey());
  const contract = new Contract(cfg.settlementContractId);

  return buildAndSubmit(
    server,
    account,
    contract,
    cfg.networkPassphrase,
    "report_leakage",
    [
      new Address(admin.publicKey()).toScVal(),
      nativeToScVal(invoiceId, { type: "string" }),
    ],
    admin,
  );
}
