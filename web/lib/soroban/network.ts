export const AXIAL_NETWORK_COOKIE = "axial_network";

export type StellarNetworkId = "testnet" | "mainnet";

// Axial runs on Mainnet only. Testnet is retired as an operating target;
// the `testnet` branch of the type/config is kept for tooling but the app
// always resolves to Mainnet.
export const DEFAULT_STELLAR_NETWORK: StellarNetworkId = "mainnet";

const MAINNET_USDC_SAC =
  "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";

/** Mainnet-only: the app always operates on Mainnet regardless of input. */
export function parseNetwork(_raw?: string | null): StellarNetworkId {
  return "mainnet";
}

export function networkLabel(network: StellarNetworkId): string {
  return network === "mainnet" ? "Mainnet" : "Testnet";
}

export function defaultRpc(network: StellarNetworkId): string {
  return network === "mainnet"
    ? "https://mainnet.sorobanrpc.com"
    : "https://soroban-testnet.stellar.org";
}

export function defaultPassphrase(network: StellarNetworkId): string {
  return network === "mainnet"
    ? "Public Global Stellar Network ; September 2015"
    : "Test SDF Network ; September 2015";
}

export function defaultUsdcTokenId(network: StellarNetworkId): string | null {
  return network === "mainnet" ? MAINNET_USDC_SAC : null;
}
