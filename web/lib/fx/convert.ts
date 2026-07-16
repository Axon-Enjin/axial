import { getPhpPerUsdc } from "@/lib/fx/reflector";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";

/** Whole USDC units for Soroban i128 demos (not stroops). */
export function phpToUsdcWhole(phpAmount: number, phpPerUsdc: number): number {
  if (!Number.isFinite(phpAmount) || !Number.isFinite(phpPerUsdc) || phpPerUsdc <= 0) {
    return 0;
  }
  return Math.trunc(phpAmount / phpPerUsdc);
}

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
