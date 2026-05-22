export const AXIAL_NETWORK_COOKIE = "axial_network";

export type StellarNetworkId = "testnet" | "mainnet";

export const DEFAULT_STELLAR_NETWORK: StellarNetworkId = "testnet";

const MAINNET_USDC_SAC =
  "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";

export function parseNetwork(raw: string | null | undefined): StellarNetworkId {
  return raw === "mainnet" ? "mainnet" : "testnet";
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
