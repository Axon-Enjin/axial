import { NextResponse } from "next/server";
import {
  getAuthUser,
  isServerAuthConfigured,
  type AuthUser,
} from "@/lib/supabase/server";

export type SessionAccessMode = "operator" | "read";

export type SessionGateOk = {
  denied: null;
  user: AuthUser | null;
};

export type SessionGateDenied = {
  denied: NextResponse;
  user: null;
};

/**
 * Session gate for org-scoped API routes.
 *
 * - Auth configured: session required for both modes; returns the user.
 * - Auth not configured + read: allow (local file-fallback UI).
 * - Auth not configured + operator: allow in development or AXIAL_ALLOW_SEED;
 *   otherwise 401.
 */
export async function assertSessionAccess(
  mode: SessionAccessMode = "read",
): Promise<SessionGateOk | SessionGateDenied> {
  if (isServerAuthConfigured()) {
    const user = await getAuthUser();
    if (!user) {
      return {
        denied: NextResponse.json({ error: "Sign in required" }, { status: 401 }),
        user: null,
      };
    }
    return { denied: null, user };
  }

  if (mode === "read") {
    return { denied: null, user: null };
  }

  if (process.env.NODE_ENV === "development") {
    return { denied: null, user: null };
  }
  if (process.env.AXIAL_ALLOW_SEED === "true") {
    return { denied: null, user: null };
  }

  return {
    denied: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    user: null,
  };
}
