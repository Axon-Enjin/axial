import { usdcWholeToStroops } from "@/lib/fx/units";
import type { SorobanConfig } from "./config";
import { quoteAdvance } from "./quote";

/** Circle USDC on Stellar mainnet (classic issuer). */
export const MAINNET_USDC_ISSUER =
  "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

const HORIZON_TIMEOUT_MS = 8_000;

function horizonBase(network: SorobanConfig["network"]): string {
  return network === "mainnet"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
}

export type UsdcTrustlineStatus = {
  hasTrustline: boolean;
  balanceStroops: number;
};

/** Classic account USDC trustline via Horizon (SAC transfers require this). */
export async function fetchUsdcTrustlineStatus(
  cfg: SorobanConfig,
  publicKey: string,
): Promise<UsdcTrustlineStatus> {
  const issuer =
    cfg.network === "mainnet"
      ? MAINNET_USDC_ISSUER
      : null;

  if (!issuer) {
    return { hasTrustline: true, balanceStroops: 0 };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HORIZON_TIMEOUT_MS);

  try {
    const res = await fetch(
      `${horizonBase(cfg.network)}/accounts/${encodeURIComponent(publicKey)}`,
      { signal: controller.signal },
    );
    if (!res.ok) {
      return { hasTrustline: false, balanceStroops: 0 };
    }
    const data = (await res.json()) as {
      balances?: Array<{
        asset_type?: string;
        asset_code?: string;
        asset_issuer?: string;
        balance?: string;
      }>;
    };
    const line = data.balances?.find(
      (b) =>
        b.asset_code === "USDC" &&
        b.asset_issuer === issuer &&
        b.asset_type === "credit_alphanum4",
    );
    if (!line) {
      return { hasTrustline: false, balanceStroops: 0 };
    }
    const whole = Number.parseFloat(line.balance ?? "0");
    const stroops = Number.isFinite(whole)
      ? Math.floor(whole * 10_000_000)
      : 0;
    return { hasTrustline: true, balanceStroops: stroops };
  } catch {
    return { hasTrustline: false, balanceStroops: 0 };
  } finally {
    clearTimeout(timer);
  }
}

export type SwapPreflightResult =
  | { ok: true }
  | { ok: false; message: string; code: "MSME_NO_TRUSTLINE" | "FUNDER_NO_TRUSTLINE" | "FUNDER_LOW_USDC" };

/**
 * Checks trustlines and funder USDC before axial_swap::execute_advance.
 * SAC error #13 = TrustlineMissingError on the recipient.
 */
export async function assertSwapPreflight(
  cfg: SorobanConfig,
  msmePublic: string,
  faceAmount: number,
): Promise<SwapPreflightResult> {
  const { advance } = quoteAdvance(faceAmount);
  const advanceStroops = usdcWholeToStroops(advance);

  const [funder, msme] = await Promise.all([
    cfg.funderPublic
      ? fetchUsdcTrustlineStatus(cfg, cfg.funderPublic)
      : Promise.resolve({ hasTrustline: false, balanceStroops: 0 }),
    fetchUsdcTrustlineStatus(cfg, msmePublic),
  ]);

  if (!msme.hasTrustline) {
    return {
      ok: false,
      code: "MSME_NO_TRUSTLINE",
      message:
        "Your Freighter wallet needs a USDC trustline to receive the swap advance. " +
        "In Freighter → Assets → add USDC (Stellar mainnet), then retry.",
    };
  }

  if (cfg.funderPublic && !funder.hasTrustline) {
    return {
      ok: false,
      code: "FUNDER_NO_TRUSTLINE",
      message:
        "Treasury (funder) wallet is missing a USDC trustline. " +
        "Add USDC on the deployer account GB6TMT… or fund via the team ops wallet.",
    };
  }

  if (
    cfg.funderPublic &&
    funder.hasTrustline &&
    funder.balanceStroops < advanceStroops
  ) {
    return {
      ok: false,
      code: "FUNDER_LOW_USDC",
      message:
        `Treasury USDC balance is too low for this advance (needs ≥ ${advanceStroops} stroops). ` +
        "Send USDC to the funder wallet on mainnet.",
    };
  }

  return { ok: true };
}

export type PayrollPreflightResult =
  | { ok: true }
  | { ok: false; message: string; code: "PAYER_NO_TRUSTLINE" | "PAYER_LOW_USDC" };

/**
 * Checks the Freighter/payer wallet can fund a payroll route (whole USDC units).
 */
export async function assertPayrollPreflight(
  cfg: SorobanConfig,
  payerPublic: string,
  grossUsdcWhole: number,
): Promise<PayrollPreflightResult> {
  const needStroops = usdcWholeToStroops(grossUsdcWhole);
  const payer = await fetchUsdcTrustlineStatus(cfg, payerPublic);

  if (!payer.hasTrustline) {
    return {
      ok: false,
      code: "PAYER_NO_TRUSTLINE",
      message:
        "Your Freighter wallet needs a USDC trustline before routing payroll. " +
        "In Freighter → Assets → add USDC, then retry.",
    };
  }

  if (payer.balanceStroops < needStroops) {
    return {
      ok: false,
      code: "PAYER_LOW_USDC",
      message:
        `Wallet USDC is too low for this payroll run (needs ≥ ${needStroops} stroops). ` +
        "Fund the wallet, then retry.",
    };
  }

  return { ok: true };
}
