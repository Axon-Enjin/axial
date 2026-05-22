import {
  Address,
  Contract,
  Keypair,
  nativeToScVal,
  rpc,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import type { SorobanConfig } from "./config";

export type MintReceivableResult = {
  txHash: string;
  status: "submitted";
};

function formatSimulationError(error: string): string {
  if (error.includes("Error(Contract, #4)")) {
    return "This invoice is already tokenized on testnet.";
  }
  if (error.includes("Error(Contract, #5)")) {
    return "Invalid face amount for receivable.";
  }
  if (error.includes("Error(Contract, #6)")) {
    return "Only the issuer (admin) can mint receivables.";
  }
  if (error.includes("Error(Contract, #1)")) {
    return "Receivable contract is not initialized.";
  }
  return error.length > 200 ? `${error.slice(0, 200)}…` : error;
}

export async function mintReceivableOnChain(
  cfg: SorobanConfig,
  invoiceId: string,
  faceAmount: number,
  /**
   * Optional Freighter wallet public key to use as the receivable token recipient.
   * When provided, the SAC token is minted directly to the user's self-custodied
   * wallet instead of the server-managed MSME account.
   * Falls back to cfg.msmePublic if not set.
   */
  msmePublicOverride?: string,
): Promise<MintReceivableResult> {
  if (
    !cfg.receivableContractId ||
    !cfg.issuerSecret ||
    !cfg.issuerPublic ||
    !cfg.msmePublic
  ) {
    throw new Error("Soroban receivable env is not configured");
  }

  const msmePublic = msmePublicOverride ?? cfg.msmePublic;

  const server = new rpc.Server(cfg.rpcUrl);
  const issuer = Keypair.fromSecret(cfg.issuerSecret);
  if (issuer.publicKey() !== cfg.issuerPublic) {
    throw new Error("STELLAR_ISSUER_PUBLIC does not match STELLAR_ISSUER_SECRET");
  }

  const account = await server.getAccount(issuer.publicKey());
  const contract = new Contract(cfg.receivableContractId);

  const tx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: cfg.networkPassphrase,
  })
    .addOperation(
      contract.call(
        "mint",
        new Address(cfg.issuerPublic).toScVal(),
        new Address(msmePublic).toScVal(),
        nativeToScVal(invoiceId, { type: "string" }),
        nativeToScVal(BigInt(Math.trunc(faceAmount)), { type: "i128" }),
      ),
    )
    .setTimeout(180)
    .build();

  const simulation = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(formatSimulationError(simulation.error));
  }

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(issuer);

  const send = await server.sendTransaction(prepared);
  if (send.status === "ERROR") {
    throw new Error(send.errorResult?.toXDR("base64") ?? "transaction failed");
  }

  return { txHash: send.hash, status: "submitted" };
}
