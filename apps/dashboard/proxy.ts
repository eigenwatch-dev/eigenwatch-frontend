import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const PUBLIC_PATHS = ["/connect"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip internal Next.js paths and static assets
  if (
    pathname.startsWith("/_next") || // Next.js internal (JS, CSS, etc.)
    pathname.startsWith("/api") || // API routes (handled separately)
    pathname.startsWith("/static") || // Static directory
    pathname.includes(".") || // Files with extensions (images, favicons, etc.)
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Skip auth check for public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // 3. Allow through if any auth token exists (AuthProvider handles refresh)
  if (accessToken || refreshToken) {
    return NextResponse.next();
  }

  // 4. No tokens at all → redirect to connect page
  const connectUrl = new URL("/connect", request.url);
  connectUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
  return NextResponse.redirect(connectUrl);
}

// Ensure the proxy only runs on relevant routes to save performance
// and avoid intercepting static assets at the engine level
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
