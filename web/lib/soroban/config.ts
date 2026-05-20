import { loadTestnetDeployment } from "./deployments";

export type SorobanConfig = {
  rpcUrl: string;
  networkPassphrase: string;
  network: string;
  swapContractId: string | null;
  receivableContractId: string | null;
  payrollContractId: string | null;
  usdcTokenId: string | null;
  funderSecret: string | null;
  funderPublic: string | null;
  issuerSecret: string | null;
  issuerPublic: string | null;
  msmeSecret: string | null;
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
  const receivableContractId =
    process.env.RECEIVABLE_TOKEN_CONTRACT_ID ??
    deployment?.contracts?.receivable_token ??
    null;
  const payrollContractId =
    process.env.PAYROLL_SPLIT_CONTRACT_ID ??
    deployment?.contracts?.payroll_split ??
    null;
  const usdcTokenId =
    process.env.SOROBAN_USDC_TOKEN_ID ??
    deployment?.contracts?.usdc_token ??
    null;
  const funderPublic =
    process.env.STELLAR_FUNDER_PUBLIC ??
    deployment?.roles?.funder_public ??
    null;
  const issuerPublic =
    process.env.STELLAR_ISSUER_PUBLIC ??
    deployment?.roles?.admin_public ??
    null;
  const msmePublic =
    process.env.STELLAR_MSME_PUBLIC ?? deployment?.roles?.msme_public ?? null;

  const hasEnv =
    Boolean(process.env.AXIAL_SWAP_CONTRACT_ID) ||
    Boolean(process.env.RECEIVABLE_TOKEN_CONTRACT_ID) ||
    Boolean(process.env.PAYROLL_SPLIT_CONTRACT_ID);
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
    receivableContractId,
    payrollContractId,
    usdcTokenId,
    funderSecret: process.env.STELLAR_FUNDER_SECRET ?? null,
    funderPublic,
    issuerSecret: process.env.STELLAR_ISSUER_SECRET ?? null,
    issuerPublic,
    msmeSecret: process.env.STELLAR_MSME_SECRET ?? null,
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

export function isReceivableChainEnabled(cfg: SorobanConfig = getSorobanConfig()) {
  return Boolean(
    cfg.receivableContractId &&
      cfg.issuerSecret &&
      cfg.issuerPublic &&
      cfg.msmePublic,
  );
}

export function isPayrollChainEnabled(cfg: SorobanConfig = getSorobanConfig()) {
  return Boolean(
    cfg.payrollContractId && cfg.msmeSecret && cfg.msmePublic && cfg.usdcTokenId,
  );
}

/** Public-only snapshot for UI (no secrets). */
export function getPublicChainStatus(cfg: SorobanConfig = getSorobanConfig()) {
  return {
    network: cfg.network,
    configSource: cfg.configSource,
    onChainReady: isSwapChainEnabled(cfg),
    receivableReady: isReceivableChainEnabled(cfg),
    payrollReady: isPayrollChainEnabled(cfg),
    swapContractId: cfg.swapContractId,
    receivableContractId: cfg.receivableContractId,
    payrollContractId: cfg.payrollContractId,
    usdcTokenId: cfg.usdcTokenId,
    funderPublic: cfg.funderPublic,
    msmePublic: cfg.msmePublic,
    issuerPublic: cfg.issuerPublic,
    explorerContractBase:
      cfg.network === "mainnet"
        ? "https://stellar.expert/explorer/public/contract"
        : "https://stellar.expert/explorer/testnet/contract",
    explorerTxBase:
      cfg.network === "mainnet"
        ? "https://stellar.expert/explorer/public/tx"
        : "https://stellar.expert/explorer/testnet/tx",
  };
}
