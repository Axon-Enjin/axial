import {
  Address,
  Contract,
  Keypair,
  nativeToScVal,
  rpc,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import type { SorobanConfig } from "./config";

export type ExecuteAdvanceResult = {
  txHash: string;
  status: "submitted";
};

function formatSimulationError(error: string): string {
  if (error.includes("Error(Contract, #4)")) {
    return "This invoice is already funded on testnet. Each invoice ID can only be swapped once.";
  }
  if (error.includes("Error(Contract, #5)")) {
    return "Invalid face amount for swap.";
  }
  if (error.includes("Error(Contract, #1)")) {
    return "Swap contract is not initialized on this deployment.";
  }
  // Stellar Asset Contract (USDC) errors surfaced through axial_swap
  if (error.includes("Error(Contract, #13)")) {
    return (
      "Recipient has no USDC trustline (SAC error #13). " +
      "In Freighter → Assets → add USDC on mainnet, then retry the swap."
    );
  }
  if (error.includes("Error(Contract, #10)")) {
    return (
      "Treasury USDC balance too low for this advance (SAC error #10). " +
      "Fund the funder wallet with USDC on mainnet."
    );
  }
  if (error.includes("HostError") || error.includes("Event log")) {
    if (error.includes("#13")) {
      return (
        "Recipient has no USDC trustline. Add USDC in Freighter (mainnet), then retry."
      );
    }
    if (error.includes("#10")) {
      return "Treasury USDC balance too low. Fund the funder wallet with USDC.";
    }
  }
  return error.length > 200 ? `${error.slice(0, 200)}…` : error;
}

export async function executeAdvanceOnChain(
  cfg: SorobanConfig,
  invoiceId: string,
  faceAmount: number,
  /**
   * Optional Freighter wallet public key to use as the MSME recipient.
   * When provided, the USDC advance is sent directly to the user's
   * self-custodied wallet instead of the server-managed MSME account.
   * Falls back to cfg.msmePublic if not set.
   */
  msmePublicOverride?: string,
): Promise<ExecuteAdvanceResult> {
  if (
    !cfg.swapContractId ||
    !cfg.funderSecret ||
    !cfg.funderPublic ||
    !cfg.msmePublic
  ) {
    throw new Error("Soroban swap env is not configured");
  }

  const msmePublic = msmePublicOverride ?? cfg.msmePublic;

  const server = new rpc.Server(cfg.rpcUrl);
  const funder = Keypair.fromSecret(cfg.funderSecret);
  if (funder.publicKey() !== cfg.funderPublic) {
    throw new Error("STELLAR_FUNDER_PUBLIC does not match STELLAR_FUNDER_SECRET");
  }

  const account = await server.getAccount(funder.publicKey());
  const contract = new Contract(cfg.swapContractId);

  const tx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: cfg.networkPassphrase,
  })
    .addOperation(
      contract.call(
        "execute_advance",
        new Address(cfg.funderPublic).toScVal(),
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
  prepared.sign(funder);

  const send = await server.sendTransaction(prepared);
  if (send.status === "ERROR") {
    throw new Error(send.errorResult?.toXDR("base64") ?? "transaction failed");
  }

  return { txHash: send.hash, status: "submitted" };
}
