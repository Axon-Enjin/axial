import { isServerAuthConfigured } from "@/lib/supabase/server";

export type FunderPortalAccessMode = "token" | "session" | "dev" | "none";

export type FunderPortalAccess = {
  authorized: boolean;
  mode: FunderPortalAccessMode;
  readOnly: true;
};

export function getFunderPortalTokenFromEnv(): string | null {
  const token = process.env.AXIAL_FUNDER_PORTAL_TOKEN?.trim();
  return token || null;
}

export function validateFunderPortalToken(token: string | null | undefined): boolean {
  const expected = getFunderPortalTokenFromEnv();
  if (!expected || !token?.trim()) return false;
  return token.trim() === expected;
}

/** v1: token magic link, org session preview, or open in local dev (no Supabase). */
export function resolveFunderPortalAccess(options: {
  token?: string | null;
  hasSession: boolean;
  role?: string | null;
}): FunderPortalAccess {
  if (!isServerAuthConfigured()) {
    return { authorized: true, mode: "dev", readOnly: true };
  }

  if (validateFunderPortalToken(options.token)) {
    return { authorized: true, mode: "token", readOnly: true };
  }

  if (options.hasSession) {
    return { authorized: true, mode: "session", readOnly: true };
  }

  return { authorized: false, mode: "none", readOnly: true };
}

export function buildFunderPortalUrl(baseUrl: string, token?: string | null): string {
  const url = new URL("/app/funder-portal", baseUrl);
  if (token?.trim()) {
    url.searchParams.set("token", token.trim());
  }
  return url.toString();
}
