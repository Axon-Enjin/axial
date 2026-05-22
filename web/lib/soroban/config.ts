import { loadDeployment } from "./deployments";
import { cleanEnvString } from "./env-sanitize";

export type SorobanConfig = {
  rpcUrl: string;
  networkPassphrase: string;
  network: string;
  swapContractId: string | null;
  receivableContractId: string | null;
  payrollContractId: string | null;
  settlementContractId: string | null;
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
  const isMainnet =
    process.env.STELLAR_NETWORK_PASSPHRASE?.includes("Public Global") ||
    process.env.STELLAR_NETWORK === "mainnet";
  const deployment = loadDeployment(isMainnet ? "mainnet" : "testnet");
  const fromFile = Boolean(deployment?.contracts?.axial_swap);

  const swapContractId = cleanEnvString(
    process.env.AXIAL_SWAP_CONTRACT_ID ?? deployment?.contracts?.axial_swap ?? null,
  );
  const receivableContractId = cleanEnvString(
    process.env.RECEIVABLE_TOKEN_CONTRACT_ID ??
      deployment?.contracts?.receivable_token ??
      null,
  );
  const payrollContractId = cleanEnvString(
    process.env.PAYROLL_SPLIT_CONTRACT_ID ??
      deployment?.contracts?.payroll_split ??
      null,
  );
  const settlementContractId = cleanEnvString(
    process.env.SETTLEMENT_CONTRACT_ID ?? deployment?.contracts?.settlement ?? null,
  );
  const usdcTokenId = cleanEnvString(
    process.env.SOROBAN_USDC_TOKEN_ID ?? deployment?.contracts?.usdc_token ?? null,
  );
  const funderPublic = cleanEnvString(
    process.env.STELLAR_FUNDER_PUBLIC ?? deployment?.roles?.funder_public ?? null,
  );
  const issuerPublic = cleanEnvString(
    process.env.STELLAR_ISSUER_PUBLIC ?? deployment?.roles?.admin_public ?? null,
  );
  const msmePublic = cleanEnvString(
    process.env.STELLAR_MSME_PUBLIC ?? deployment?.roles?.msme_public ?? null,
  );

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
      cleanEnvString(process.env.SOROBAN_RPC_URL) ??
      deployment?.rpc ??
      "https://soroban-testnet.stellar.org",
    networkPassphrase:
      cleanEnvString(process.env.STELLAR_NETWORK_PASSPHRASE) ??
      deployment?.passphrase ??
      "Test SDF Network ; September 2015",
    network: deployment?.network ?? "testnet",
    swapContractId,
    receivableContractId,
    payrollContractId,
    settlementContractId,
    usdcTokenId,
    funderSecret: cleanEnvString(process.env.STELLAR_FUNDER_SECRET),
    funderPublic,
    issuerSecret: cleanEnvString(process.env.STELLAR_ISSUER_SECRET),
    issuerPublic,
    msmeSecret: cleanEnvString(process.env.STELLAR_MSME_SECRET),
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

/**
 * Whether the server can build an unsigned payroll XDR for Freighter signing.
 * Requires only the contract ID — not the server-held MSME secret.
 */
export function isPayrollBuildEnabled(cfg: SorobanConfig = getSorobanConfig()) {
  return Boolean(cfg.payrollContractId);
}

/** Public-only snapshot for UI (no secrets). */
export function getPublicChainStatus(cfg: SorobanConfig = getSorobanConfig()) {
  return {
    network: cfg.network,
    configSource: cfg.configSource,
    onChainReady: isSwapChainEnabled(cfg),
    receivableReady: isReceivableChainEnabled(cfg),
    payrollReady: isPayrollChainEnabled(cfg),
    payrollBuildReady: isPayrollBuildEnabled(cfg),
    swapContractId: cfg.swapContractId,
    receivableContractId: cfg.receivableContractId,
    payrollContractId: cfg.payrollContractId,
    settlementContractId: cfg.settlementContractId,
    usdcTokenId: cfg.usdcTokenId,
    funderPublic: cfg.funderPublic,
    msmePublic: cfg.msmePublic,
    issuerPublic: cfg.issuerPublic,
    rpcUrl: cfg.rpcUrl,
    networkPassphrase: cfg.networkPassphrase,
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
