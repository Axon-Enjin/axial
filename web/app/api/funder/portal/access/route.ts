import { NextResponse } from "next/server";
import {
  resolveFunderPortalAccess,
  validateFunderPortalToken,
} from "@/lib/funder/portal-auth";
import { getAuthUser, isServerAuthConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  const user = await getAuthUser();
  const access = resolveFunderPortalAccess({
    token,
    hasSession: Boolean(user),
    role: user?.role,
  });

  return NextResponse.json({
    ...access,
    authConfigured: isServerAuthConfigured(),
    tokenConfigured: Boolean(process.env.AXIAL_FUNDER_PORTAL_TOKEN?.trim()),
    role: user?.role ?? null,
  });
}

export async function POST(request: Request) {
  let body: { token?: string };
  try {
    body = (await request.json()) as { token?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!validateFunderPortalToken(body.token)) {
    return NextResponse.json({ error: "Invalid portal token" }, { status: 401 });
  }

  return NextResponse.json({ ok: true, mode: "token" as const });
}
