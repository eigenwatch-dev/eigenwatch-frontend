import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BASE_URL || "";
const API_KEY = process.env.API_KEY || "";

// Auth endpoints that don't require a Bearer token
const AUTH_PUBLIC_PATHS = [
  "auth/challenge",
  "auth/verify",
  "auth/refresh",
  "auth/logout",
];

async function proxyRequest(req: NextRequest, params: { path: string[] }) {
  const path = params.path.join("/");
  const targetUrl = `${BASE_URL}api/v1/${path}`;

  // Forward Authorization header if present
  const authHeader = req.headers.get("authorization");

  // Block unauthenticated requests except for auth flow endpoints
  const isAuthPath = AUTH_PUBLIC_PATHS.some((p) => path.startsWith(p));
  if (!isAuthPath && !authHeader) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 },
    );
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };

  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  // Forward cookies for refresh token
  const cookie = req.headers.get("cookie");
  if (cookie) {
    headers["Cookie"] = cookie;
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  // Forward body for non-GET requests
  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      const body = await req.text();
      if (body) {
        fetchOptions.body = body;
      }
    } catch {
      // No body
    }
  }

  const response = await fetch(targetUrl, fetchOptions);

  // Build response, forwarding status and body
  const responseBody = await response.text();
  const res = new NextResponse(responseBody, {
    status: response.status,
    statusText: response.statusText,
  });

  // Forward content-type
  const contentType = response.headers.get("content-type");
  if (contentType) {
    res.headers.set("content-type", contentType);
  }

  // Forward set-cookie headers (for refresh tokens)
  const setCookies = response.headers.getSetCookie?.() || [];
  for (const cookie of setCookies) {
    res.headers.append("set-cookie", cookie);
  }

  return res;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, await params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, await params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, await params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, await params);
}
