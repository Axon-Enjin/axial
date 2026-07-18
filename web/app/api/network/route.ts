import { NextResponse } from "next/server";
import { assertSessionAccess } from "@/lib/auth/session-gate";
import {
  isNetworkDeployedInRepo,
  getSorobanConfig,
  isSwapChainEnabled,
} from "@/lib/soroban/config";
import {
  AXIAL_NETWORK_COOKIE,
  networkLabel,
  parseNetwork,
  type StellarNetworkId,
} from "@/lib/soroban/network";
import { getSelectedNetwork } from "@/lib/soroban/selected-network";

function networkPayload(network: StellarNetworkId) {
  const cfg = getSorobanConfig(network);
  return {
    network,
    label: networkLabel(network),
    onChainReady: isSwapChainEnabled(cfg) && cfg.l1ContractsDeployed,
    l1ContractsDeployed: cfg.l1ContractsDeployed,
    testnetWiredInRepo: isNetworkDeployedInRepo("testnet"),
    mainnetWiredInRepo: isNetworkDeployedInRepo("mainnet"),
  };
}

export async function GET() {
  const gate = await assertSessionAccess("read");
  if (gate.denied) return gate.denied;

  const network = await getSelectedNetwork();
  return NextResponse.json(networkPayload(network));
}

export async function POST(request: Request) {
  const gate = await assertSessionAccess("read");
  if (gate.denied) return gate.denied;

  let body: { network?: string };
  try {
    body = (await request.json()) as { network?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = body.network?.trim().toLowerCase();
  if (raw !== "mainnet" && raw !== "testnet") {
    return NextResponse.json(
      { error: 'network must be "mainnet" or "testnet"' },
      { status: 400 },
    );
  }

  const network = parseNetwork(raw);
  const payload = networkPayload(network);
  const res = NextResponse.json(payload);
  res.cookies.set(AXIAL_NETWORK_COOKIE, network, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
