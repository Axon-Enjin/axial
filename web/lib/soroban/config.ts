import { loadTestnetDeployment } from "./deployments";

export type SorobanConfig = {
  rpcUrl: string;
  networkPassphrase: string;
  network: string;
  swapContractId: string | null;
  usdcTokenId: string | null;
  funderSecret: string | null;
  funderPublic: string | null;
  msmePublic: string | null;
  configSource: "env" | "deployments" | "mixed" | "default";
};

export function getSorobanConfig(): SorobanConfig {
  const deployment = loadTestnetDeployment();
  const fromFile = Boolean(deployment?.contracts?.axial_swap);

  const swapContractId =
    process.env.AXIAL_SWAP_CONTRACT_ID ??
    deployment?.contracts?.axial_swap ??
    null;
  const usdcTokenId =
    process.env.SOROBAN_USDC_TOKEN_ID ??
    deployment?.contracts?.usdc_token ??
    null;
  const funderPublic =
    process.env.STELLAR_FUNDER_PUBLIC ??
    deployment?.roles?.funder_public ??
    null;
  const msmePublic =
    process.env.STELLAR_MSME_PUBLIC ?? deployment?.roles?.msme_public ?? null;

  const hasEnv =
    Boolean(process.env.AXIAL_SWAP_CONTRACT_ID) ||
    Boolean(process.env.SOROBAN_USDC_TOKEN_ID);
  const configSource: SorobanConfig["configSource"] = hasEnv
    ? fromFile
      ? "mixed"
      : "env"
    : fromFile
      ? "deployments"
      : "default";

  return {
    rpcUrl:
      process.env.SOROBAN_RPC_URL ??
      deployment?.rpc ??
      "https://soroban-testnet.stellar.org",
    networkPassphrase:
      process.env.STELLAR_NETWORK_PASSPHRASE ??
      deployment?.passphrase ??
      "Test SDF Network ; September 2015",
    network: deployment?.network ?? "testnet",
    swapContractId,
    usdcTokenId,
    funderSecret: process.env.STELLAR_FUNDER_SECRET ?? null,
    funderPublic,
    msmePublic,
    configSource,
  };
}

export function isSwapChainEnabled(cfg: SorobanConfig = getSorobanConfig()) {
  return Boolean(
    cfg.swapContractId &&
      cfg.funderSecret &&
      cfg.funderPublic &&
      cfg.msmePublic,
  );
}

/** Public-only snapshot for UI (no secrets). */
export function getPublicChainStatus(cfg: SorobanConfig = getSorobanConfig()) {
  return {
    network: cfg.network,
    configSource: cfg.configSource,
    onChainReady: isSwapChainEnabled(cfg),
    swapContractId: cfg.swapContractId,
    usdcTokenId: cfg.usdcTokenId,
    funderPublic: cfg.funderPublic,
    msmePublic: cfg.msmePublic,
    explorerBase: "https://stellar.expert/explorer/testnet/contract",
  };
}
