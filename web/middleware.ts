/**
 * Next.js middleware — Supabase session refresh + route protection.
 *
 * Two responsibilities:
 * 1. Refresh the Supabase auth session on every request (prevents stale tokens)
 * 2. Redirect unauthenticated users from /app/* to /login
 *
 * Auth bypass: if Supabase is not configured (no SUPABASE_URL / anon key),
 * the middleware is a no-op and /app/* is accessible without auth.
 * This supports the local dev file-fallback mode.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    "";

  // If auth is not configured, pass through — local dev / file-fallback mode
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  // Build a mutable response so Supabase can set/refresh session cookies
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refresh session — MUST call getUser() (not getSession()) per Supabase docs
  // getSession() is not validated server-side; getUser() hits the auth server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAppRoute = url.pathname.startsWith("/app");
  const isAuthRoute =
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/signup") ||
    url.pathname.startsWith("/invite");
  const isPayerPortal = url.pathname.startsWith("/app/payer-portal");
  const isFunderPortal = url.pathname.startsWith("/app/funder-portal");

  // Token portals use their own auth — always allow through middleware
  if (isPayerPortal || isFunderPortal) {
    return supabaseResponse;
  }

  // Safe base URL for external redirects (fixes 0.0.0.0 proxy redirect issues in containers)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || url.origin;

  // Redirect unauthenticated users trying to access protected app routes
  if (isAppRoute && !user) {
    const loginUrl = new URL("/login", baseUrl);
    loginUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/app", baseUrl));
  }

  return supabaseResponse;
}

export const config = {
  // Run on all routes except static assets and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
