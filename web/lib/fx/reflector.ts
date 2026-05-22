/**
 * Reflector oracle client — PHP/USDC FX rate via Stellar Soroban RPC.
 *
 * Reflector is the canonical Stellar-native price oracle (reflector.network).
 * This module fetches the live PHP/USDC rate from the deployed oracle contract
 * and caches it in-process (per serverless instance) with a 5-minute TTL.
 * Falls back to a hardcoded rate if the oracle call fails for any reason.
 *
 * Oracle convention: lastprice(Asset::Other("PHP")) returns the price of 1 PHP
 * denominated in USDC (the base asset), with `decimals()` decimal places.
 * To get the display rate (PHP per USDC):
 *   phpPerUsdc = 10^decimals / priceRaw
 *
 * References:
 *   Reflector v2 contract ABI — github.com/reflector-network/reflector-contract
 *   Axial.md §13.8 — locked FX decision
 */

import {
  Account,
  Contract,
  rpc,
  scValToNative,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Fallback rate (PHP per USDC) when oracle is unreachable. */
export const FALLBACK_RATE_PHP_PER_USDC = 56.5;

/**
 * Reflector oracle v2 contract IDs.
 * Override via REFLECTOR_CONTRACT_ID env var for custom deployments.
 *
 * Testnet: official Reflector testnet oracle
 * Mainnet: https://stellar.expert/explorer/public/contract/CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN65
 */
const REFLECTOR_TESTNET = "CALEAOELRJFKDX5YEDSTQB5SQXK38T47RTBP3LVCFK4IADOCSGDVF6T";
const REFLECTOR_MAINNET = "CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN65";

/** Default oracle decimals (Reflector v2 uses 14 decimal places). */
const DEFAULT_DECIMALS = 14;

/** Cache TTL: 5 minutes per serverless instance. */
const CACHE_TTL_MS = 5 * 60 * 1000;

// ── In-process cache ──────────────────────────────────────────────────────────

type RateCache = {
  phpPerUsdc: number;
  source: "reflector" | "fallback";
  contractId: string;
  fetchedAt: number;
};

let _cache: RateCache | null = null;

function isCacheValid(): boolean {
  return _cache !== null && Date.now() - _cache.fetchedAt < CACHE_TTL_MS;
}

export type FxRateResult = {
  phpPerUsdc: number;
  source: "reflector" | "fallback";
  contractId: string | null;
  cachedAt: string | null;
  error: string | null;
};

// ── Reflector oracle call ─────────────────────────────────────────────────────

/**
 * Calls Reflector's `lastprice(Asset::Other("PHP"))` via Soroban simulation.
 * Returns null if the asset is unsupported or the call fails.
 *
 * The simulation uses a random in-memory Account so no real account is needed.
 */
async function fetchReflectorPrice(
  rpcUrl: string,
  contractId: string,
  passphrase: string,
): Promise<number | null> {
  const server = new rpc.Server(rpcUrl);
  const contract = new Contract(contractId);

  // Encode Asset::Other("PHP") as ScVec([Symbol("Other"), Symbol("PHP")])
  // This matches Soroban's #[contracttype] enum encoding for single-element tuple variants.
  const phpAsset = xdr.ScVal.scvVec([
    xdr.ScVal.scvSymbol("Other"),
    xdr.ScVal.scvSymbol("PHP"),
  ]);

  // Use a throwaway keypair as source — only simulating, not submitting
  const dummyPublic = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN";
  const account = new Account(dummyPublic, "0");

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: passphrase,
  })
    .addOperation(contract.call("lastprice", phpAsset))
    .setTimeout(30)
    .build();

  let simulation: Awaited<ReturnType<typeof server.simulateTransaction>>;
  try {
    simulation = await server.simulateTransaction(tx);
  } catch {
    return null;
  }

  if (rpc.Api.isSimulationError(simulation)) {
    return null;
  }

  if (!rpc.Api.isSimulationSuccess(simulation) || !simulation.result?.retval) {
    return null;
  }

  // Decode the Option<PriceData> return value
  let native: unknown;
  try {
    native = scValToNative(simulation.result.retval);
  } catch {
    return null;
  }

  // Option<PriceData>: null if asset not found, or { price: BigInt, timestamp: BigInt }
  if (native == null) return null;
  const data = native as Record<string, unknown>;
  const priceRaw = data["price"];
  if (priceRaw == null) return null;

  const rawBigInt = typeof priceRaw === "bigint" ? priceRaw : BigInt(String(priceRaw));
  if (rawBigInt <= 0n) return null;

  // Convert: 1 PHP = priceRaw / 10^decimals USDC → PHP per USDC = 10^decimals / priceRaw
  const decimals = DEFAULT_DECIMALS;
  const factor = BigInt(10) ** BigInt(decimals);
  const phpPerUsdcRaw = Number(factor) / Number(rawBigInt);

  // Sanity check: PHP/USDC should be between 20 and 200
  if (phpPerUsdcRaw < 20 || phpPerUsdcRaw > 200) return null;

  return phpPerUsdcRaw;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the PHP/USDC FX rate.
 *
 * On success: rate from the Reflector oracle (cached 5 min).
 * On failure: falls back to FALLBACK_RATE_PHP_PER_USDC (56.5) — any error
 * during the oracle call is silently absorbed.
 */
export async function getPhpPerUsdc(opts: {
  rpcUrl: string;
  networkPassphrase: string;
  network: string;
}): Promise<FxRateResult> {
  // Return cached value if fresh
  if (isCacheValid() && _cache) {
    return {
      phpPerUsdc: _cache.phpPerUsdc,
      source: _cache.source,
      contractId: _cache.contractId,
      cachedAt: new Date(_cache.fetchedAt).toISOString(),
      error: null,
    };
  }

  const contractId =
    process.env.REFLECTOR_CONTRACT_ID ??
    (opts.network === "mainnet" ? REFLECTOR_MAINNET : REFLECTOR_TESTNET);

  let phpPerUsdc = FALLBACK_RATE_PHP_PER_USDC;
  let source: "reflector" | "fallback" = "fallback";
  let error: string | null = null;

  try {
    const fetched = await fetchReflectorPrice(opts.rpcUrl, contractId, opts.networkPassphrase);
    if (fetched !== null) {
      phpPerUsdc = fetched;
      source = "reflector";
    } else {
      error = "Oracle returned null (PHP may not be a supported asset on this network)";
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Oracle call failed";
  }

  // Update cache regardless of source (also caches fallback to prevent hammering)
  _cache = { phpPerUsdc, source, contractId, fetchedAt: Date.now() };

  return {
    phpPerUsdc,
    source,
    contractId,
    cachedAt: new Date(_cache.fetchedAt).toISOString(),
    error,
  };
}

/** Invalidates the in-process rate cache. */
export function invalidateRateCache(): void {
  _cache = null;
}
