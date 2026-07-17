import "server-only";

import { cookies } from "next/headers";
import {
  AXIAL_NETWORK_COOKIE,
  DEFAULT_STELLAR_NETWORK,
  parseNetwork,
  type StellarNetworkId,
} from "./network";

/** Server-only: reads the user's network choice from the cookie. */
export async function getSelectedNetwork(): Promise<StellarNetworkId> {
  const store = await cookies();
  return parseNetwork(store.get(AXIAL_NETWORK_COOKIE)?.value ?? DEFAULT_STELLAR_NETWORK);
}
