/**
 * Freighter browser extension API (client-side only).
 * Uses the window.freighter global injected by the Freighter extension.
 * https://docs.freighter.app/docs/guide/gettingStarted
 *
 * Never import this in server-only code — all functions guard against
 * SSR by checking typeof window !== "undefined".
 */

export type FreighterNetworkDetails = {
  network: string;
  networkUrl: string;
  networkPassphrase: string;
};

export type FreighterState = {
  publicKey: string;
  networkDetails: FreighterNetworkDetails;
};

// Type the global Freighter extension injection
// Handles both v1 (returns string) and v2 (returns object) signTransaction APIs.
interface FreighterExtension {
  isConnected(): Promise<boolean | { isConnected: boolean }>;
  getPublicKey(): Promise<string>;
  signTransaction(
    xdr: string,
    opts?: {
      network?: string;
      networkPassphrase?: string;
      accountToSign?: string;
    },
  ): Promise<string | { signedTxXdr: string; signerAddress: string }>;
  getNetworkDetails(): Promise<FreighterNetworkDetails>;
  requestAccess?(): Promise<{ publicKey: string }>;
}

declare global {
  interface Window {
    freighter?: FreighterExtension;
  }
}

/** Returns true if the Freighter extension is installed and the page is in a browser. */
export function freighterAvailable(): boolean {
  return typeof window !== "undefined" && Boolean(window.freighter);
}

/**
 * Checks whether Freighter is currently connected (has an active session).
 * Returns false if the extension is not installed.
 */
export async function checkFreighterConnected(): Promise<boolean> {
  if (!freighterAvailable()) return false;
  try {
    const result = await window.freighter!.isConnected();
    // v2 API returns { isConnected: boolean }; v1 API returns boolean
    if (typeof result === "object" && result !== null) {
      return (result as { isConnected: boolean }).isConnected;
    }
    return Boolean(result);
  } catch {
    return false;
  }
}

/**
 * Prompts Freighter for the user's public key.
 * On Freighter v2+, requestAccess is preferred; falls back to getPublicKey.
 * Throws if the extension is not installed or the user rejects.
 */
export async function getFreighterPublicKey(): Promise<string> {
  if (!freighterAvailable()) {
    throw new Error("Freighter extension not installed. Install it from freighter.app.");
  }
  const ext = window.freighter!;
  // Prefer requestAccess (grants permission + returns key in one step)
  if (typeof ext.requestAccess === "function") {
    const result = await ext.requestAccess();
    return result.publicKey;
  }
  return ext.getPublicKey();
}

/** Returns the network Freighter is currently pointed at. */
export async function getFreighterNetworkDetails(): Promise<FreighterNetworkDetails> {
  if (!freighterAvailable()) {
    throw new Error("Freighter extension not installed.");
  }
  return window.freighter!.getNetworkDetails();
}

/**
 * Signs a prepared Soroban transaction XDR string with Freighter.
 * Returns the signed XDR string (base64 envelope).
 *
 * @param xdr - Unsigned prepared transaction XDR (from /api/[type]/build endpoints)
 * @param opts.networkPassphrase - Must match the Stellar network
 * @param opts.accountToSign - The account that must sign (Freighter will prompt)
 */
export async function signXdrWithFreighter(
  xdr: string,
  opts: { networkPassphrase?: string; accountToSign?: string },
): Promise<string> {
  if (!freighterAvailable()) {
    throw new Error("Freighter extension not installed.");
  }
  const result = await window.freighter!.signTransaction(xdr, opts);
  // Handle both v1 (returns string) and v2 (returns { signedTxXdr, signerAddress })
  if (typeof result === "string") return result;
  return (result as { signedTxXdr: string; signerAddress: string }).signedTxXdr;
}

/** Stellar testnet friendbot URL to fund a new account. */
export function friendbotUrl(publicKey: string): string {
  return `https://friendbot.stellar.org/?addr=${encodeURIComponent(publicKey)}`;
}

/**
 * Funds a Stellar testnet account via the friendbot faucet.
 * Throws if the request fails.
 */
export async function fundTestnetAccount(publicKey: string): Promise<void> {
  const res = await fetch(friendbotUrl(publicKey));
  if (!res.ok) {
    throw new Error(`Friendbot failed (${res.status}). Account may already be funded.`);
  }
}
