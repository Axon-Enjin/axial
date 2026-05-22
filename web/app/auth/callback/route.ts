/**
 * GET /auth/callback
 *
 * Handles Supabase Auth redirect callbacks for:
 * - Magic link (email OTP) sign-in
 * - OAuth provider sign-in (Google, GitHub)
 * - Invite acceptance (links email invite to a new/existing account)
 *
 * After verifying the code, redirects to the `next` param (default: /app).
 */
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app";
  const inviteToken = url.searchParams.get("invite_token");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // Propagate auth errors back to login page
  if (error) {
    const loginUrl = new URL("/login", url);
    loginUrl.searchParams.set("error", errorDescription ?? error);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const supabase = await getSupabaseServer();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      const loginUrl = new URL("/login", url);
      loginUrl.searchParams.set("error", exchangeError.message);
      return NextResponse.redirect(loginUrl);
    }

    // If this was an invite acceptance, redirect to the invite page to finalize
    if (inviteToken) {
      const inviteUrl = new URL("/invite", url);
      inviteUrl.searchParams.set("token", inviteToken);
      return NextResponse.redirect(inviteUrl);
    }
  }

  // Successful auth — redirect to intended destination
  return NextResponse.redirect(new URL(next, url));
}
