import {
  NonceResponse,
  VerifyResponse,
  RefreshResponse,
  User,
  UserEmail,
  UserSession,
  UserPreferences,
} from "@/types/auth.types";
import useAuthStore from "@/hooks/store/useAuthStore";
import { setAuthCookie, clearAuthCookie } from "@/actions/utils";

const BASE_URL = "";

// ==================== CORE INFRASTRUCTURE ====================

export class AuthApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.body = body;
  }
}

function authHeaders(accessToken?: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AuthApiError(
      body?.message || `Request failed with status ${res.status}`,
      res.status,
      body,
    );
  }
  const json = await res.json();
  return json.data ?? json;
}

// Prevent multiple simultaneous refresh calls
let refreshPromise: Promise<string> | null = null;

/**
 * Get a valid access token — refresh if the current one is falsy.
 */
async function getValidToken(): Promise<string> {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) return accessToken;

  return doRefresh();
}

/**
 * Perform a token refresh, deduplicating concurrent calls.
 * Exported as silentRefresh for use by AuthProvider.
 */
export async function doRefresh(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const data = await refreshToken();
      useAuthStore.getState().setAccessToken(data.tokens.access_token);
      await setAuthCookie(data.tokens.access_token);
      useAuthStore.getState().setUser(data.user);
      return data.tokens.access_token;
    } catch {
      // Refresh failed — session is truly expired
      useAuthStore.getState().logout();
      await clearAuthCookie();
      throw new AuthApiError("Session expired. Please sign in again.", 401);
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Authenticated fetch wrapper. Automatically:
 * 1. Gets a valid token (refreshing if needed) before the request
 * 2. Retries once on 401 after refreshing the token
 */
async function authFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  // Get a valid token before making the request
  const token = await getValidToken();

  const headers = {
    ...authHeaders(token),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // If 401, try refreshing once and retry
  if (res.status === 401) {
    const newToken = await doRefresh();

    return fetch(url, {
      ...options,
      headers: {
        ...authHeaders(newToken),
        ...(options.headers || {}),
      },
      credentials: "include",
    });
  }

  return res;
}

// ==================== AUTH (public — no token needed) ====================

export async function getNonce(address: string): Promise<NonceResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/challenge`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ address }),
  });
  return handleResponse<NonceResponse>(res);
}

export async function verifySignature(
  address: string,
  signature: string,
  nonce: string,
): Promise<VerifyResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/verify`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ address, signature, nonce }),
    credentials: "include",
  });
  return handleResponse<VerifyResponse>(res);
}

export async function refreshToken(): Promise<RefreshResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: authHeaders(),
    credentials: "include",
  });
  return handleResponse<RefreshResponse>(res);
}

export async function logoutApi(accessToken: string): Promise<void> {
  await fetch(`${BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: authHeaders(accessToken),
    credentials: "include",
  });
}

// ==================== AUTH (protected — uses authFetch) ====================

export async function logout() {
  try {
    // Call backend to clear httpOnly cookie
    await fetch(`${BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    // Always clear local state
    useAuthStore.getState().logout();
    await clearAuthCookie();
  }
}

export async function getMe(): Promise<User> {
  const res = await authFetch(`${BASE_URL}/api/v1/auth/me`, {
    method: "GET",
  });
  return handleResponse<User>(res);
}

// ==================== EMAIL ====================

export async function addEmail(
  email: string,
  options?: { risk_alerts?: boolean; marketing?: boolean },
): Promise<{ message: string; email_id: string }> {
  const res = await authFetch(`${BASE_URL}/api/v1/auth/email/add`, {
    method: "POST",
    body: JSON.stringify({ email, ...options }),
  });
  return handleResponse<{ message: string; email_id: string }>(res);
}

export async function verifyEmail(
  email: string,
  code: string,
): Promise<{ message: string }> {
  const res = await authFetch(`${BASE_URL}/api/v1/auth/email/verify`, {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
  return handleResponse<{ message: string }>(res);
}

export async function resendVerification(
  email: string,
): Promise<{ message: string }> {
  const res = await authFetch(`${BASE_URL}/api/v1/auth/email/resend`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return handleResponse<{ message: string }>(res);
}

export async function removeEmail(emailId: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/v1/auth/email/${emailId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AuthApiError(
      body?.message || "Failed to remove email",
      res.status,
      body,
    );
  }
}

export async function setPrimaryEmail(emailId: string): Promise<void> {
  const res = await authFetch(
    `${BASE_URL}/api/v1/auth/email/${emailId}/primary`,
    { method: "PUT" },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AuthApiError(
      body?.message || "Failed to set primary email",
      res.status,
      body,
    );
  }
}

// ==================== USER PROFILE ====================

export async function updateProfile(data: {
  display_name?: string;
}): Promise<User> {
  const res = await authFetch(`${BASE_URL}/api/v1/user/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return handleResponse<User>(res);
}

// ==================== PREFERENCES ====================

export async function getPreferences(): Promise<UserPreferences> {
  const res = await authFetch(`${BASE_URL}/api/v1/user/preferences`, {
    method: "GET",
  });
  return handleResponse<UserPreferences>(res);
}

export async function updatePreferences(
  preferences: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const res = await authFetch(`${BASE_URL}/api/v1/user/preferences`, {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
  return handleResponse<UserPreferences>(res);
}

// ==================== SESSIONS ====================

export async function getSessions(): Promise<UserSession[]> {
  const res = await authFetch(`${BASE_URL}/api/v1/user/sessions`, {
    method: "GET",
  });
  return handleResponse<UserSession[]>(res);
}

export async function revokeSession(sessionId: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/v1/user/sessions/${sessionId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AuthApiError(
      body?.message || "Failed to revoke session",
      res.status,
      body,
    );
  }
}

export async function revokeAllSessions(): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/v1/user/sessions`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AuthApiError(
      body?.message || "Failed to revoke all sessions",
      res.status,
      body,
    );
  }
}

// ==================== ACCOUNT ====================

export async function deleteAccount(): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/v1/user/account`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AuthApiError(
      body?.message || "Failed to delete account",
      res.status,
      body,
    );
  }
}
