import {
  Address,
  Contract,
  rpc,
  scValToNative,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import type { SorobanConfig } from "./config";
import { formatUsdcStroops } from "./quote";

export type DemoWalletRole = "funder" | "msme" | "issuer";

export type DemoWalletBalance = {
  role: DemoWalletRole;
  label: string;
  publicKey: string;
  xlm: string;
  xlmStroops: number;
  usdc: string | null;
  usdcStroops: number | null;
  explorerAccountUrl: string;
  friendbotUrl: string | null;
};

const HORIZON_TIMEOUT_MS = 6_000;
const SOROBAN_TIMEOUT_MS = 6_000;
const CACHE_TTL_MS = 15_000;
const STALE_CACHE_MS = 60_000;

let balanceCache: {
  at: number;
  network: string;
  data: { network: string; wallets: DemoWalletBalance[] };
} | null = null;

function explorerAccountBase(network: string): string {
  return network === "mainnet"
    ? "https://stellar.expert/explorer/public/account"
    : "https://stellar.expert/explorer/testnet/account";
}

function horizonBase(network: string): string {
  return network === "mainnet"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function fetchNativeXlm(
  network: string,
  publicKey: string,
): Promise<{ display: string; stroops: number }> {
  try {
    const res = await fetch(`${horizonBase(network)}/accounts/${publicKey}`, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(HORIZON_TIMEOUT_MS),
    });
    if (!res.ok) {
      return { display: "—", stroops: 0 };
    }
    const data = (await res.json()) as {
      balances?: { asset_type: string; balance: string }[];
    };
    const native = data.balances?.find((b) => b.asset_type === "native");
    const stroops = Math.round(Number(native?.balance ?? 0) * 10_000_000);
    const xlm = stroops / 10_000_000;
    return {
      display: xlm.toLocaleString(undefined, { maximumFractionDigits: 4 }),
      stroops,
    };
  } catch {
    return { display: "—", stroops: 0 };
  }
}

async function fetchSacUsdcBalance(
  cfg: SorobanConfig,
  publicKey: string,
): Promise<number | null> {
  if (!cfg.usdcTokenId) return null;

  const server = new rpc.Server(cfg.rpcUrl);
  try {
    const account = await withTimeout(
      server.getAccount(publicKey),
      SOROBAN_TIMEOUT_MS,
      "Soroban getAccount",
    );
    const contract = new Contract(cfg.usdcTokenId);
    const tx = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: cfg.networkPassphrase,
    })
      .addOperation(contract.call("balance", new Address(publicKey).toScVal()))
      .setTimeout(30)
      .build();

    const sim = await withTimeout(
      server.simulateTransaction(tx),
      SOROBAN_TIMEOUT_MS,
      "Soroban simulateTransaction",
    );
    if (rpc.Api.isSimulationError(sim) || !sim.result?.retval) {
      return null;
    }
    const native = scValToNative(sim.result.retval);
    return Number(BigInt(String(native)));
  } catch {
    return null;
  }
}

async function fetchDemoWalletBalancesUncached(
  cfg: SorobanConfig,
): Promise<{
  network: string;
  wallets: DemoWalletBalance[];
}> {
  const explorerBase = explorerAccountBase(cfg.network);
  const isTestnet = cfg.network !== "mainnet";

  const roles: { role: DemoWalletRole; label: string; publicKey: string | null }[] =
    [
      { role: "funder", label: "Treasury (funder)", publicKey: cfg.funderPublic },
      { role: "msme", label: "MSME wallet", publicKey: cfg.msmePublic },
      { role: "issuer", label: "Issuer (admin)", publicKey: cfg.issuerPublic },
    ];

  const wallets = await Promise.all(
    roles
      .filter((r): r is typeof r & { publicKey: string } => Boolean(r.publicKey))
      .map(async ({ role, label, publicKey }) => {
        const [xlm, usdcStroops] = await Promise.all([
          fetchNativeXlm(cfg.network, publicKey),
          fetchSacUsdcBalance(cfg, publicKey),
        ]);

        return {
          role,
          label,
          publicKey,
          xlm: xlm.display,
          xlmStroops: xlm.stroops,
          usdc: usdcStroops != null ? formatUsdcStroops(usdcStroops) : null,
          usdcStroops,
          explorerAccountUrl: `${explorerBase}/${publicKey}`,
          friendbotUrl: isTestnet
            ? `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
            : null,
        };
      }),
  );

  return { network: cfg.network, wallets };
}

export async function fetchDemoWalletBalances(
  cfg: SorobanConfig,
): Promise<{
  network: string;
  wallets: DemoWalletBalance[];
}> {
  if (
    balanceCache &&
    balanceCache.network === cfg.network &&
    Date.now() - balanceCache.at < CACHE_TTL_MS
  ) {
    return balanceCache.data;
  }

  try {
    const data = await fetchDemoWalletBalancesUncached(cfg);
    balanceCache = { at: Date.now(), network: cfg.network, data };
    return data;
  } catch (err) {
    if (
      balanceCache &&
      balanceCache.network === cfg.network &&
      Date.now() - balanceCache.at < STALE_CACHE_MS
    ) {
      return balanceCache.data;
    }
    throw err;
  }
}
