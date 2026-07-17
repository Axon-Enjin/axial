import { readFileSync } from "node:fs";
import { join } from "node:path";

export type TestnetDeployment = {
  network: string;
  passphrase: string;
  rpc: string;
  deployed_at?: string;
  roles?: {
    admin_public?: string;
    funder_public?: string;
    msme_public?: string;
  };
  contracts?: {
    axial_swap?: string | null;
    receivable_token?: string | null;
    payroll_split?: string | null;
    settlement?: string | null;
    contractor_payroll?: string | null;
    usdc_token?: string | null;
  };
};

/** Loads soroban/deployments/testnet.json (repo root relative to web/). */
export function loadTestnetDeployment(): TestnetDeployment | null {
  return loadDeployment("testnet");
}

/** Loads soroban/deployments/mainnet.json (repo root relative to web/). */
export function loadMainnetDeployment(): TestnetDeployment | null {
  return loadDeployment("mainnet");
}

/**
 * Loads a deployment JSON by network name.
 * Returns null if the file doesn't exist (not deployed yet).
 */
export function loadDeployment(network: "testnet" | "mainnet"): TestnetDeployment | null {
  try {
    const path = join(
      process.cwd(),
      "..",
      "soroban",
      "deployments",
      `${network}.json`,
    );
    return JSON.parse(readFileSync(path, "utf8")) as TestnetDeployment;
  } catch {
    return null;
  }
}
