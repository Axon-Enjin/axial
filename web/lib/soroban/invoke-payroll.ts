import {
  Address,
  Contract,
  Keypair,
  nativeToScVal,
  rpc,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import type { SorobanConfig } from "./config";

export type RoutePayrollResult = {
  txHash: string;
  status: "submitted";
};

function formatSimulationError(error: string): string {
  if (error.includes("Error(Contract, #4)")) {
    return "This payroll batch was already routed on testnet.";
  }
  if (error.includes("Error(Contract, #5)")) {
    return "Invalid gross payroll amount.";
  }
  if (error.includes("Error(Contract, #1)")) {
    return "Payroll contract is not initialized.";
  }
  return error.length > 200 ? `${error.slice(0, 200)}…` : error;
}

export async function routePayrollOnChain(
  cfg: SorobanConfig,
  payrollId: string,
  grossAmount: number,
): Promise<RoutePayrollResult> {
  if (
    !cfg.payrollContractId ||
    !cfg.msmeSecret ||
    !cfg.msmePublic
  ) {
    throw new Error("Soroban payroll env is not configured");
  }

  const server = new rpc.Server(cfg.rpcUrl);
  const payer = Keypair.fromSecret(cfg.msmeSecret);
  if (payer.publicKey() !== cfg.msmePublic) {
    throw new Error("STELLAR_MSME_PUBLIC does not match STELLAR_MSME_SECRET");
  }

  const account = await server.getAccount(payer.publicKey());
  const contract = new Contract(cfg.payrollContractId);

  const tx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: cfg.networkPassphrase,
  })
    .addOperation(
      contract.call(
        "route_payroll",
        new Address(cfg.msmePublic).toScVal(),
        nativeToScVal(payrollId, { type: "string" }),
        nativeToScVal(BigInt(Math.trunc(grossAmount)), { type: "i128" }),
      ),
    )
    .setTimeout(180)
    .build();

  const simulation = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(formatSimulationError(simulation.error));
  }

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(payer);

  const send = await server.sendTransaction(prepared);
  if (send.status === "ERROR") {
    throw new Error(send.errorResult?.toXDR("base64") ?? "transaction failed");
  }

  return { txHash: send.hash, status: "submitted" };
}
