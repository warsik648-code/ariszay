import { NextResponse, type NextRequest } from "next/server";

const ADMIN_PATHS = ["/admin"];
const BYPASS_PATHS = ["/api/", "/_next/", "/_vercel/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (BYPASS_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Admin guard — role check done in admin layout
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    const sessionCookie =
      request.cookies.get("ariszay.session_token") ??
      request.cookies.get("better-auth.session_token");

    if (!sessionCookie) {
      const loginUrl = new URL("/auth/sign-in", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
