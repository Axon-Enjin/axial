import { NextResponse } from "next/server";
import { getAuthUser, isServerAuthConfigured } from "@/lib/supabase/server";

export type EisAccessMode = "operator" | "read";

/**
 * Returns a 401 response when access is denied, or null when the caller may proceed.
 *
 * - Auth configured: session required for both modes.
 * - Auth not configured + read: allow (local file-fallback UI).
 * - Auth not configured + operator: allow in development or when AXIAL_ALLOW_SEED;
 *   otherwise 401 (production without auth config).
 */
export async function assertEisOperatorAccess(
  mode: EisAccessMode = "operator",
): Promise<NextResponse | null> {
  if (isServerAuthConfigured()) {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return null;
  }

  if (mode === "read") {
    return null;
  }

  if (process.env.NODE_ENV === "development") {
    return null;
  }
  if (process.env.AXIAL_ALLOW_SEED === "true") {
    return null;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
