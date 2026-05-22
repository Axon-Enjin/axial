import {
  Asset,
  Keypair,
  Memo,
  Operation,
  TransactionBuilder,
  rpc,
} from "@stellar/stellar-sdk";
import { getSorobanConfig, type SorobanConfig } from "@/lib/soroban/config";
import type { StellarNetworkId } from "@/lib/soroban/network";

/** Stellar text memo max 28 bytes — compact BIR ref for demo. */
export function formatMemoText(birReferenceId: string): string {
  const compact = birReferenceId.replace(/^BIR-/, "BIR:");
  return compact.length <= 28 ? compact : compact.slice(0, 28);
}

/**
 * Anchor memo on a new payment tx (0.0000001 XLM) signed by issuer/admin.
 * Links BIR acknowledgement back to the Stellar audit trail.
 */
export async function writeBirMemoToStellar(
  birReferenceId: string,
  sourceTxHash: string,
  network: StellarNetworkId = "mainnet",
): Promise<{ memoTxHash: string; memoText: string }> {
  const cfg: SorobanConfig = getSorobanConfig(network);
  const secret = cfg.issuerSecret;
  const publicKey = cfg.issuerPublic;
  if (!secret || !publicKey) {
    throw new Error(
      `${network === "mainnet" ? "MAINNET_" : ""}STELLAR_ISSUER_SECRET required for memo write-back`,
    );
  }

  const signer = Keypair.fromSecret(secret);
  if (signer.publicKey() !== publicKey) {
    throw new Error("Issuer public key does not match secret");
  }

  const memoText = formatMemoText(birReferenceId);
  const server = new rpc.Server(cfg.rpcUrl);
  const account = await server.getAccount(signer.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: cfg.networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination: signer.publicKey(),
        asset: Asset.native(),
        amount: "0.0000001",
      }),
    )
    .addMemo(Memo.text(memoText))
    .setTimeout(180)
    .build();

  tx.sign(signer);

  const send = await server.sendTransaction(tx);
  if (send.status === "ERROR") {
    throw new Error(
      send.errorResult?.toXDR("base64") ?? `memo write-back failed for ${sourceTxHash}`,
    );
  }

  return { memoTxHash: send.hash, memoText };
}
