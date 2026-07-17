import "server-only";

import { getPhpPerUsdc } from "@/lib/fx/reflector";
import { phpToUsdcWhole } from "@/lib/fx/units";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";

/** Server-only: FX pin for invoice face. Client: import pure helpers from `@/lib/fx/units`. */
export async function resolveFaceUsdc(facePhp: number): Promise<{
  faceUsdc: number;
  phpPerUsdc: number;
  source: string;
}> {
  const cfg = await resolveSorobanConfig();
  const rate = await getPhpPerUsdc({
    rpcUrl: cfg.rpcUrl,
    networkPassphrase: cfg.networkPassphrase,
    network: cfg.network,
  });
  return {
    faceUsdc: phpToUsdcWhole(facePhp, rate.phpPerUsdc),
    phpPerUsdc: rate.phpPerUsdc,
    source: rate.source,
  };
}
