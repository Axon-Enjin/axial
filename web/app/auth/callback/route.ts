/**
 * GET /auth/callback
 *
 * Handles Supabase Auth redirect callbacks for:
 * - Magic link (email OTP) sign-in
 * - OAuth provider sign-in (Google, GitHub)
 * - Invite acceptance (links email invite to a new/existing account)
 *
 * After verifying the code, redirects to the `next` param (default: /app).
 * Session cookies are written onto the redirect response (avoids orphaned chunks / 431).
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/app";
  }
  return next;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));
  const inviteToken = url.searchParams.get("invite_token");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || url.origin;

  if (error) {
    const loginUrl = new URL("/login", baseUrl);
    loginUrl.searchParams.set("error", errorDescription ?? error);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    return NextResponse.redirect(new URL(next, baseUrl));
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    "";

  const destination = inviteToken
    ? (() => {
        const inviteUrl = new URL("/invite", baseUrl);
        inviteUrl.searchParams.set("token", inviteToken);
        return inviteUrl;
      })()
    : new URL(next, baseUrl);

  const response = NextResponse.redirect(destination);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const loginUrl = new URL("/login", baseUrl);
    loginUrl.searchParams.set("error", exchangeError.message);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
