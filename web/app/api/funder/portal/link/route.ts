import { NextResponse } from "next/server";
import {
  buildFunderPortalUrl,
  getFunderPortalTokenFromEnv,
} from "@/lib/funder/portal-auth";
import { getAuthUser, isServerAuthConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function resolveBaseUrl(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin
  );
}

/** MSME operators — generate a shareable funder portal URL (includes token when configured). */
export async function GET(request: Request) {
  const baseUrl = resolveBaseUrl(request);

  if (!isServerAuthConfigured()) {
    return NextResponse.json({
      url: buildFunderPortalUrl(baseUrl),
      hasToken: false,
      mode: "dev",
    });
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to generate a portal link" }, { status: 401 });
  }

  const portalToken = getFunderPortalTokenFromEnv();
  return NextResponse.json({
    url: buildFunderPortalUrl(baseUrl, portalToken),
    hasToken: Boolean(portalToken),
    mode: "share",
  });
}
