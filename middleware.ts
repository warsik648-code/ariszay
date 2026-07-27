import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

/** Paths that require admin-level authentication (checked server-side in layouts). */
const ADMIN_PATHS = ["/admin"];

/** Paths that skip locale processing entirely. */
const BYPASS_PATHS = ["/api/", "/_next/", "/_vercel/"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (BYPASS_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Admin path guard — full server-side check is done in the admin layout.
  // Here we just ensure the session cookie exists before even rendering the layout.
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (isAdminPath) {
    const sessionCookie =
      request.cookies.get("ariszay.session_token") ??
      request.cookies.get("better-auth.session_token");

    if (!sessionCookie) {
      const loginUrl = new URL("/auth/sign-in", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Actual role check is done in the admin layout server component
    return NextResponse.next();
  }

  // Apply i18n middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(zh|en)/:path*",
    "/admin/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
