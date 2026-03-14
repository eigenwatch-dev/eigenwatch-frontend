import type {
  AdminStats,
  AdminUser,
  Feedback,
  PaymentTransaction,
  BetaMember,
  BetaPerk,
} from "@/types/admin.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.eigenwatch.xyz";
const API_PREFIX = "/api/v1/admin";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${API_PREFIX}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data.data ?? data;
}

// Auth
export async function adminLogin(email: string, password: string) {
  return request<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getAdminProfile() {
  return request<{ email: string; isAdmin: boolean }>("/auth/me");
}

// Stats
export async function getAdminStats() {
  return request<AdminStats>("/stats");
}

// Users
export async function getAdminUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  tier?: string;
  sort?: string;
  order?: string;
}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  return request<{
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/users?${searchParams.toString()}`);
}

export async function getAdminUser(id: string) {
  return request<AdminUser>(`/users/${id}`);
}

export async function updateUserTier(
  id: string,
  tier: string,
  expiresAt?: string | null,
) {
  return request<AdminUser>(`/users/${id}/tier`, {
    method: "PATCH",
    body: JSON.stringify({ tier, expires_at: expiresAt }),
  });
}

// Feedback
export async function getAdminFeedback(params: {
  page?: number;
  limit?: number;
  type?: string;
  sentiment?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  return request<{
    feedback: Feedback[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/feedback?${searchParams.toString()}`);
}

export async function deleteAdminFeedback(id: string) {
  return request<{ message: string }>(`/feedback/${id}`, { method: "DELETE" });
}

// Payments
export async function getAdminPayments(params: {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  return request<{
    payments: PaymentTransaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/payments?${searchParams.toString()}`);
}

export async function getAdminPayment(id: string) {
  return request<PaymentTransaction>(`/payments/${id}`);
}

// Beta
export async function getAdminBetaMembers() {
  return request<BetaMember[]>("/beta/members");
}

export async function addBetaMember(email: string, notes?: string) {
  return request<BetaMember>("/beta/members", {
    method: "POST",
    body: JSON.stringify({ email, notes }),
  });
}

export async function removeBetaMember(email: string) {
  return request<{ message: string }>(
    `/beta/members/${encodeURIComponent(email)}`,
    {
      method: "DELETE",
    },
  );
}

export async function getAdminBetaPerks() {
  return request<BetaPerk[]>("/beta/perks");
}

export async function updateBetaPerk(
  key: string,
  data: { is_active?: boolean; config?: unknown; description?: string },
) {
  return request<BetaPerk>(`/beta/perks/${key}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function seedBetaPerks() {
  return request<{ added: number; skipped: number }>("/beta/perks/seed", {
    method: "POST",
  });
}
