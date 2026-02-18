import {
  NonceResponse,
  VerifyResponse,
  RefreshResponse,
  User,
  UserEmail,
  UserSession,
  UserPreferences,
} from "@/types/auth.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

function authHeaders(accessToken?: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
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
      body
    );
  }
  const json = await res.json();
  return json.data ?? json;
}

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

// ==================== AUTH ====================

export async function getNonce(address: string): Promise<NonceResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/nonce`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ address }),
  });
  return handleResponse<NonceResponse>(res);
}

export async function verifySignature(
  address: string,
  signature: string,
  message: string
): Promise<VerifyResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/verify`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ address, signature, message }),
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

export async function getMe(accessToken: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    method: "GET",
    headers: authHeaders(accessToken),
    credentials: "include",
  });
  return handleResponse<User>(res);
}

// ==================== EMAIL ====================

export async function addEmail(
  accessToken: string,
  email: string,
  preferences?: { marketing: boolean; risk_alerts: boolean }
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/email/add`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ email, ...preferences }),
    credentials: "include",
  });
  return handleResponse<{ message: string }>(res);
}

export async function verifyEmail(
  accessToken: string,
  email: string,
  code: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/email/verify`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ email, code }),
    credentials: "include",
  });
  return handleResponse<{ message: string }>(res);
}

export async function resendVerification(
  accessToken: string,
  email: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/email/resend`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ email }),
    credentials: "include",
  });
  return handleResponse<{ message: string }>(res);
}

export async function removeEmail(
  accessToken: string,
  emailId: string
): Promise<void> {
  await fetch(`${BASE_URL}/api/v1/auth/email/${emailId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
    credentials: "include",
  });
}

export async function setPrimaryEmail(
  accessToken: string,
  emailId: string
): Promise<void> {
  await fetch(`${BASE_URL}/api/v1/auth/email/${emailId}/primary`, {
    method: "PUT",
    headers: authHeaders(accessToken),
    credentials: "include",
  });
}

// ==================== USER PROFILE ====================

export async function updateProfile(
  accessToken: string,
  data: { display_name?: string }
): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/v1/user/profile`, {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(data),
    credentials: "include",
  });
  return handleResponse<User>(res);
}

// ==================== PREFERENCES ====================

export async function getPreferences(
  accessToken: string
): Promise<UserPreferences> {
  const res = await fetch(`${BASE_URL}/api/v1/user/preferences`, {
    method: "GET",
    headers: authHeaders(accessToken),
    credentials: "include",
  });
  return handleResponse<UserPreferences>(res);
}

export async function updatePreferences(
  accessToken: string,
  preferences: Partial<UserPreferences>
): Promise<UserPreferences> {
  const res = await fetch(`${BASE_URL}/api/v1/user/preferences`, {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(preferences),
    credentials: "include",
  });
  return handleResponse<UserPreferences>(res);
}

// ==================== SESSIONS ====================

export async function getSessions(
  accessToken: string
): Promise<UserSession[]> {
  const res = await fetch(`${BASE_URL}/api/v1/user/sessions`, {
    method: "GET",
    headers: authHeaders(accessToken),
    credentials: "include",
  });
  return handleResponse<UserSession[]>(res);
}

export async function revokeSession(
  accessToken: string,
  sessionId: string
): Promise<void> {
  await fetch(`${BASE_URL}/api/v1/user/sessions/${sessionId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
    credentials: "include",
  });
}

export async function revokeAllSessions(accessToken: string): Promise<void> {
  await fetch(`${BASE_URL}/api/v1/user/sessions`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
    credentials: "include",
  });
}

// ==================== ACCOUNT ====================

export async function deleteAccount(accessToken: string): Promise<void> {
  await fetch(`${BASE_URL}/api/v1/user/account`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
    credentials: "include",
  });
}
