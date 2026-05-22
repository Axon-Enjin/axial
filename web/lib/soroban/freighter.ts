/**
 * Freighter browser extension (client-side only).
 * Uses @stellar/freighter-api — the supported integration path for current Freighter.
 * https://docs.freighter.app/docs/guide/usingfreighterwebapp/
 */

import {
  getAddress,
  getNetworkDetails,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";

export type FreighterNetworkDetails = {
  network: string;
  networkUrl: string;
  networkPassphrase: string;
};

function freighterErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message: string }).message;
    if (msg) return msg;
  }
  return fallback;
}

/** Quick sync hint for SSR/hydration — async probe refines this in AppProvider. */
export function freighterMaybeInstalled(): boolean {
  return typeof window !== "undefined";
}

/** Whether the Freighter extension is installed. */
export async function probeFreighterInstalled(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const result = await isConnected();
    return Boolean(result.isConnected);
  } catch {
    return false;
  }
}

/** @deprecated Use probeFreighterInstalled — kept for sync call sites during hydration */
export function freighterAvailable(): boolean {
  return freighterMaybeInstalled();
}

export async function checkFreighterConnected(): Promise<boolean> {
  try {
    const conn = await isConnected();
    if (!conn.isConnected) return false;
    const addr = await getAddress();
    if (addr.error) return false;
    return Boolean(addr.address?.startsWith("G"));
  } catch {
    return false;
  }
}

/** Restore session without popup if app is already on Freighter Allow List. */
export async function tryRestoreFreighterSession(): Promise<{
  publicKey: string;
  networkDetails: FreighterNetworkDetails;
} | null> {
  try {
    const conn = await isConnected();
    if (!conn.isConnected) return null;
    const addr = await getAddress();
    if (addr.error || !addr.address?.startsWith("G")) return null;
    const details = await getFreighterNetworkDetails().catch(
      (): FreighterNetworkDetails => ({
        network: "PUBLIC",
        networkUrl: "https://horizon.stellar.org",
        networkPassphrase: "Public Global Stellar Network ; September 2015",
      }),
    );
    return { publicKey: addr.address, networkDetails: details };
  } catch {
    return null;
  }
}

/**
 * Prompts Freighter for the user's public key (Allow List / connect popup).
 */
export async function getFreighterPublicKey(): Promise<string> {
  const conn = await isConnected();
  if (!conn.isConnected) {
    throw new Error(
      "Freighter extension not installed. Install it from https://freighter.app and refresh this page.",
    );
  }

  const access = await requestAccess();
  if (access.error) {
    throw new Error(
      freighterErrorMessage(access.error, "Freighter access denied or cancelled."),
    );
  }
  if (access.address?.startsWith("G")) {
    return access.address;
  }

  const addr = await getAddress();
  if (addr.error) {
    throw new Error(freighterErrorMessage(addr.error, "Could not read Freighter address."));
  }
  if (addr.address?.startsWith("G")) {
    return addr.address;
  }

  throw new Error(
    "Freighter did not return a public key. Unlock Freighter, approve this site, and try again.",
  );
}

export async function getFreighterNetworkDetails(): Promise<FreighterNetworkDetails> {
  const conn = await isConnected();
  if (!conn.isConnected) {
    throw new Error("Freighter extension not installed.");
  }

  const details = await getNetworkDetails();
  if (details.error) {
    throw new Error(freighterErrorMessage(details.error, "Could not read Freighter network."));
  }

  return {
    network: details.network ?? "UNKNOWN",
    networkUrl: details.networkUrl ?? "",
    networkPassphrase: details.networkPassphrase ?? "",
  };
}

export async function signXdrWithFreighter(
  xdr: string,
  opts: { networkPassphrase?: string; accountToSign?: string },
): Promise<string> {
  const conn = await isConnected();
  if (!conn.isConnected) {
    throw new Error("Freighter extension not installed.");
  }

  const result = await signTransaction(xdr, {
    networkPassphrase: opts.networkPassphrase,
    address: opts.accountToSign,
  });

  if (result.error) {
    throw new Error(freighterErrorMessage(result.error, "Freighter signing failed."));
  }
  if (!result.signedTxXdr) {
    throw new Error("Freighter did not return a signed transaction.");
  }
  return result.signedTxXdr;
}

export function friendbotUrl(publicKey: string): string {
  return `https://friendbot.stellar.org/?addr=${encodeURIComponent(publicKey)}`;
}

export async function fundTestnetAccount(publicKey: string): Promise<void> {
  const res = await fetch(friendbotUrl(publicKey));
  if (!res.ok) {
    throw new Error(`Friendbot failed (${res.status}). Account may already be funded.`);
  }
}
