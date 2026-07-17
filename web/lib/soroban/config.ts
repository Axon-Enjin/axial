import "server-only";

import { loadDeployment } from "./deployments";
import { cleanEnvString } from "./env-sanitize";
import {
  defaultPassphrase,
  defaultRpc,
  defaultUsdcTokenId,
  type StellarNetworkId,
} from "./network";

export type SorobanConfig = {
  rpcUrl: string;
  networkPassphrase: string;
  network: StellarNetworkId;
  swapContractId: string | null;
  receivableContractId: string | null;
  payrollContractId: string | null;
  settlementContractId: string | null;
  /** Track A contractor USDC pay — Testnet-only crate. */
  contractorPayrollContractId: string | null;
  usdcTokenId: string | null;
  funderSecret: string | null;
  funderPublic: string | null;
  issuerSecret: string | null;
  issuerPublic: string | null;
  msmeSecret: string | null;
  msmePublic: string | null;
  configSource: "env" | "deployments" | "mixed" | "default";
  /** All three L1 contracts present for this network. */
  l1ContractsDeployed: boolean;
};

function envForNetwork(
  network: StellarNetworkId,
  key: string,
): string | null {
  const prefix = network === "mainnet" ? "MAINNET_" : "TESTNET_";
  const prefixed = cleanEnvString(process.env[`${prefix}${key}`]);
  if (prefixed) return prefixed;
  if (network === "testnet") {
    return cleanEnvString(process.env[key]);
  }
  return null;
}

function hasL1Contracts(contracts: {
  receivable?: string | null;
  swap?: string | null;
  payroll?: string | null;
}): boolean {
  return Boolean(contracts.receivable && contracts.swap && contracts.payroll);
}

/** Whether soroban/deployments/{network}.json exists with L1 contract IDs. */
export function isNetworkDeployedInRepo(network: StellarNetworkId): boolean {
  const deployment = loadDeployment(network);
  if (!deployment?.contracts) return false;
  return hasL1Contracts({
    receivable: deployment.contracts.receivable_token,
    swap: deployment.contracts.axial_swap,
    payroll: deployment.contracts.payroll_split,
  });
}

export function getSorobanConfig(
  network: StellarNetworkId = "mainnet",
): SorobanConfig {
  const deployment = loadDeployment(network);
  const fromFile = Boolean(deployment?.contracts?.axial_swap);

  const swapContractId = envForNetwork(network, "AXIAL_SWAP_CONTRACT_ID") ??
    cleanEnvString(deployment?.contracts?.axial_swap ?? null);
  const receivableContractId =
    envForNetwork(network, "RECEIVABLE_TOKEN_CONTRACT_ID") ??
    cleanEnvString(deployment?.contracts?.receivable_token ?? null);
  const payrollContractId =
    envForNetwork(network, "PAYROLL_SPLIT_CONTRACT_ID") ??
    cleanEnvString(deployment?.contracts?.payroll_split ?? null);
  const settlementContractId =
    envForNetwork(network, "SETTLEMENT_CONTRACT_ID") ??
    cleanEnvString(deployment?.contracts?.settlement ?? null);
  const contractorPayrollContractId =
    envForNetwork(network, "CONTRACTOR_PAYROLL_CONTRACT_ID") ??
    cleanEnvString(
      (deployment?.contracts as { contractor_payroll?: string | null } | undefined)
        ?.contractor_payroll ?? null,
    );
  const usdcTokenId =
    envForNetwork(network, "SOROBAN_USDC_TOKEN_ID") ??
    cleanEnvString(deployment?.contracts?.usdc_token ?? null) ??
    defaultUsdcTokenId(network);
  const funderPublic =
    envForNetwork(network, "STELLAR_FUNDER_PUBLIC") ??
    cleanEnvString(deployment?.roles?.funder_public ?? null);
  const issuerPublic =
    envForNetwork(network, "STELLAR_ISSUER_PUBLIC") ??
    cleanEnvString(deployment?.roles?.admin_public ?? null);
  const msmePublic =
    envForNetwork(network, "STELLAR_MSME_PUBLIC") ??
    cleanEnvString(deployment?.roles?.msme_public ?? null);

  const hasEnv =
    Boolean(envForNetwork(network, "AXIAL_SWAP_CONTRACT_ID")) ||
    Boolean(envForNetwork(network, "RECEIVABLE_TOKEN_CONTRACT_ID")) ||
    Boolean(envForNetwork(network, "PAYROLL_SPLIT_CONTRACT_ID"));
  const configSource: SorobanConfig["configSource"] = hasEnv
    ? fromFile
      ? "mixed"
      : "env"
    : fromFile
      ? "deployments"
      : "default";

  const l1ContractsDeployed = hasL1Contracts({
    receivable: receivableContractId,
    swap: swapContractId,
    payroll: payrollContractId,
  });

  return {
    rpcUrl:
      envForNetwork(network, "SOROBAN_RPC_URL") ??
      deployment?.rpc ??
      defaultRpc(network),
    networkPassphrase:
      envForNetwork(network, "STELLAR_NETWORK_PASSPHRASE") ??
      deployment?.passphrase ??
      defaultPassphrase(network),
    network,
    swapContractId,
    receivableContractId,
    payrollContractId,
    settlementContractId,
    contractorPayrollContractId,
    usdcTokenId,
    funderSecret: envForNetwork(network, "STELLAR_FUNDER_SECRET"),
    funderPublic,
    issuerSecret: envForNetwork(network, "STELLAR_ISSUER_SECRET"),
    issuerPublic,
    msmeSecret: envForNetwork(network, "STELLAR_MSME_SECRET"),
    msmePublic,
    configSource,
    l1ContractsDeployed,
  };
}

export function isSwapChainEnabled(cfg: SorobanConfig) {
  return Boolean(
    cfg.l1ContractsDeployed &&
      cfg.swapContractId &&
      cfg.funderSecret &&
      cfg.funderPublic &&
      cfg.msmePublic,
  );
}

export function isReceivableChainEnabled(cfg: SorobanConfig) {
  return Boolean(
    cfg.l1ContractsDeployed &&
      cfg.receivableContractId &&
      cfg.issuerSecret &&
      cfg.issuerPublic &&
      cfg.msmePublic,
  );
}

export function isPayrollChainEnabled(cfg: SorobanConfig) {
  return Boolean(
    cfg.l1ContractsDeployed &&
      cfg.payrollContractId &&
      cfg.msmeSecret &&
      cfg.msmePublic &&
      cfg.usdcTokenId,
  );
}

export function isPayrollBuildEnabled(cfg: SorobanConfig) {
  return Boolean(cfg.l1ContractsDeployed && cfg.payrollContractId);
}

export function isLockboxFundingEnabled(cfg: SorobanConfig): boolean {
  return Boolean(cfg.settlementContractId && cfg.usdcTokenId);
}

/** Track A is Testnet-only — never enable against Mainnet operating config. */
export function isContractorPayrollBuildEnabled(cfg: SorobanConfig): boolean {
  return (
    cfg.network === "testnet" &&
    Boolean(cfg.contractorPayrollContractId && cfg.usdcTokenId)
  );
}

/**
 * Resolve config for Track A contractor pay. Always Testnet, independent of
 * the app's Mainnet operating network.
 */
export function getContractorPayrollTestnetConfig(): SorobanConfig {
  return getSorobanConfig("testnet");
}

/** Public-only snapshot for UI (no secrets). */
export function getPublicChainStatus(cfg: SorobanConfig) {
  return {
    network: cfg.network,
    selectedNetwork: cfg.network,
    configSource: cfg.configSource,
    l1ContractsDeployed: cfg.l1ContractsDeployed,
    mainnetDeployedInRepo: isNetworkDeployedInRepo("mainnet"),
    testnetDeployedInRepo: isNetworkDeployedInRepo("testnet"),
    mainnetAvailable: getSorobanConfig("mainnet").l1ContractsDeployed,
    testnetAvailable: getSorobanConfig("testnet").l1ContractsDeployed,
    onChainReady: isSwapChainEnabled(cfg),
    receivableReady: isReceivableChainEnabled(cfg),
    payrollReady: isPayrollChainEnabled(cfg),
    payrollBuildReady: isPayrollBuildEnabled(cfg),
    lockboxFundingReady: isLockboxFundingEnabled(cfg),
    contractorPayrollReady: isContractorPayrollBuildEnabled(
      getContractorPayrollTestnetConfig(),
    ),
    swapContractId: cfg.swapContractId,
    receivableContractId: cfg.receivableContractId,
    payrollContractId: cfg.payrollContractId,
    settlementContractId: cfg.settlementContractId,
    contractorPayrollContractId: getContractorPayrollTestnetConfig()
      .contractorPayrollContractId,
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
