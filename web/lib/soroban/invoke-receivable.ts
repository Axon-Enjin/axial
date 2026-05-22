import {
  Address,
  Contract,
  Keypair,
  nativeToScVal,
  rpc,
  StrKey,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import type { SorobanConfig } from "./config";
import { cleanEnvString } from "./env-sanitize";

function keypairFromSecret(secret: string, label: string): Keypair {
  const cleaned = cleanEnvString(secret) ?? secret;
  try {
    return Keypair.fromSecret(cleaned);
  } catch {
    throw new Error(
      `${label} is invalid (Stellar SDK: invalid encoded string). ` +
        "Use the testnet secret starting with S from admin-key — not the G public address. " +
        "In GCP Secret Manager, remove trailing newlines and quotes.",
    );
  }
}

function assertContractId(id: string, label: string): string {
  const cleaned = cleanEnvString(id) ?? id;
  if (!StrKey.isValidContract(cleaned)) {
    throw new Error(
      `${label} is not a valid Soroban contract id (C...). Check GitHub vars / Cloud Run env.`,
    );
  }
  return cleaned;
}

function assertPublicKey(key: string, label: string): string {
  const cleaned = cleanEnvString(key) ?? key;
  if (!StrKey.isValidEd25519PublicKey(cleaned)) {
    throw new Error(`${label} is not a valid Stellar public key (G...).`);
  }
  return cleaned;
}

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
        new Address(issuerPublic).toScVal(),
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
