import { NextResponse } from "next/server";
import {
  AXIAL_NETWORK_COOKIE,
  parseNetwork,
  type StellarNetworkId,
} from "@/lib/soroban/network";
import { getPublicChainStatus, getSorobanConfig } from "@/lib/soroban/config";
import { getSelectedNetwork } from "@/lib/soroban/selected-network";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function networkResponse(network: StellarNetworkId, status: number) {
  const cfg = getSorobanConfig(network);
  const res = NextResponse.json(getPublicChainStatus(cfg), { status });
  res.cookies.set(AXIAL_NETWORK_COOKIE, network, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export async function GET() {
  const network = await getSelectedNetwork();
  return NextResponse.json(getPublicChainStatus(getSorobanConfig(network)));
}

export async function POST(request: Request) {
  let body: { network?: string };
  try {
    body = (await request.json()) as { network?: string };
  } catch {
    return NextResponse.json({ error: "Expected JSON body" }, { status: 400 });
  }

  const network = parseNetwork(body.network);
  const cfg = getSorobanConfig(network);

  if (network === "mainnet" && !cfg.l1ContractsDeployed) {
    return NextResponse.json(
      {
        error:
          "Mainnet contracts are not deployed yet. Run soroban/scripts/mainnet-setup.sh in WSL (or add deployments/mainnet.json).",
        ...getPublicChainStatus(cfg),
      },
      { status: 409 },
    );
  }

  return networkResponse(network, 200);
}
