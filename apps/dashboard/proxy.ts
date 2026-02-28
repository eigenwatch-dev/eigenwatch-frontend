import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const PUBLIC_PATHS = ["/connect"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Allow through if any auth token exists (AuthProvider handles refresh)
  if (accessToken || refreshToken) {
    return NextResponse.next();
  }

  // No tokens at all → redirect to connect page
  const connectUrl = new URL("/connect", request.url);
  connectUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(connectUrl);
}
