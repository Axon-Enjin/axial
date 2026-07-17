import "server-only";

import { getPublicChainStatus, getSorobanConfig, type SorobanConfig } from "./config";
import { getSelectedNetwork } from "./selected-network";

export async function resolveSorobanConfig(): Promise<SorobanConfig> {
  return getSorobanConfig(await getSelectedNetwork());
}

export async function resolvePublicChainStatus() {
  const cfg = await resolveSorobanConfig();
  return getPublicChainStatus(cfg);
}
