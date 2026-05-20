import { readFileSync } from "node:fs";
import { join } from "node:path";

export type TestnetDeployment = {
  network: string;
  passphrase: string;
  rpc: string;
  roles?: {
    admin_public?: string;
    funder_public?: string;
    msme_public?: string;
  };
  contracts?: {
    axial_swap?: string | null;
    receivable_token?: string | null;
    payroll_split?: string | null;
    usdc_token?: string | null;
  };
};

/** Loads soroban/deployments/testnet.json (repo root relative to web/). */
export function loadTestnetDeployment(): TestnetDeployment | null {
  try {
    const path = join(process.cwd(), "..", "soroban", "deployments", "testnet.json");
    return JSON.parse(readFileSync(path, "utf8")) as TestnetDeployment;
  } catch {
    return null;
  }
}
