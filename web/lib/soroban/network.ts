export const AXIAL_NETWORK_COOKIE = "axial_network";

export type StellarNetworkId = "testnet" | "mainnet";

/** Default when cookie is missing or invalid. Production operating target. */
export const DEFAULT_STELLAR_NETWORK: StellarNetworkId = "mainnet";

const MAINNET_USDC_SAC =
  "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";

/** Parse cookie/query value. Invalid → Mainnet. */
export function parseNetwork(raw?: string | null): StellarNetworkId {
  const n = (raw ?? "").trim().toLowerCase();
  if (n === "testnet" || n === "test") return "testnet";
  if (n === "mainnet" || n === "public" || n === "main") return "mainnet";
  return DEFAULT_STELLAR_NETWORK;
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

/** True if Freighter network details match the selected Axial network. */
export function freighterMatchesNetwork(
  details: { network: string; networkPassphrase: string } | null | undefined,
  selected: StellarNetworkId,
): boolean {
  if (!details) return false;
  const pass = details.networkPassphrase ?? "";
  const name = details.network.toLowerCase();
  if (selected === "mainnet") {
    return (
      pass.includes("Public Global") ||
      name.includes("mainnet") ||
      name === "public"
    );
  }
  return (
    pass.includes("Test SDF") ||
    name.includes("testnet") ||
    name === "testnet" ||
    name === "test"
  );
}
