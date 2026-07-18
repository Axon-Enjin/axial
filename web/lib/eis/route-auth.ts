import { NextResponse } from "next/server";
import { assertSessionAccess, type SessionAccessMode } from "@/lib/auth/session-gate";

export type EisAccessMode = SessionAccessMode;

/**
 * Returns a 401 response when access is denied, or null when the caller may proceed.
 * Delegates to the shared session gate.
 */
export async function assertEisOperatorAccess(
  mode: EisAccessMode = "operator",
): Promise<NextResponse | null> {
  const { denied } = await assertSessionAccess(mode);
  return denied;
}
