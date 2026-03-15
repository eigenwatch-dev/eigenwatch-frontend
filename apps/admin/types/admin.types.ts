export interface AdminUser {
  id: string;
  wallet_address: string;
  display_name: string | null;
  avatar_url: string | null;
  tier: "FREE" | "PRO" | "ENTERPRISE";
  tier_expires_at: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  emails?: UserEmail[];
  sessions?: UserSession[];
  beta_perks?: UserBetaPerk[];
  payments?: PaymentTransaction[];
  preferences?: Record<string, unknown>;
  _count?: { payments: number };
}

export interface UserEmail {
  id: string;
  email: string;
  is_primary: boolean;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
}

export interface UserSession {
  id: string;
  device_info: string | null;
  ip_address: string | null;
  created_at: string;
  expires_at: string;
}

export interface UserBetaPerk {
  id: string;
  perk_id: string;
  activated_at: string;
  notification_seen: boolean;
  metadata: Record<string, unknown> | null;
  perk: {
    id: string;
    key: string;
    description: string;
    is_active: boolean;
    config: Record<string, unknown> | null;
  };
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  amount_usd: string;
  payment_method: "CRYPTO_DIRECT" | "CHAINRAILS";
  provider_ref: string | null;
  status: "PENDING" | "CONFIRMING" | "CONFIRMED" | "FAILED" | "EXPIRED";
  tier_granted: string;
  duration_days: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    wallet_address: string;
    display_name: string | null;
    emails?: UserEmail[];
  };
  status_history?: PaymentStatusHistory[];
}

export interface PaymentStatusHistory {
  id: string;
  transaction_id: string;
  from_status: string | null;
  to_status: string;
  timestamp: string;
  metadata: Record<string, unknown> | null;
}

export interface Feedback {
  id: string;
  user_id: string | null;
  type: "GENERAL" | "INLINE" | "PAYWALL" | "FEATURE_REQUEST";
  sentiment: "POSITIVE" | "NEGATIVE" | null;
  category: string | null;
  message: string | null;
  email: string | null;
  page_url: string | null;
  section_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user?: {
    id: string;
    wallet_address: string;
    display_name: string | null;
  } | null;
}

export interface BetaMember {
  id: string;
  email: string;
  is_active: boolean;
  notes: string | null;
  added_at: string;
}

export interface BetaPerk {
  id: string;
  key: string;
  description: string;
  is_active: boolean;
  config: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminStats {
  users: {
    total: number;
    pro: number;
    enterprise: number;
    free: number;
    new_this_week: number;
    new_this_month: number;
  };
  beta: {
    active_members: number;
  };
  feedback: {
    total: number;
    by_type: Record<string, number>;
    by_sentiment: Record<string, number>;
  };
  revenue: {
    total_usd: number;
    this_month_usd: number;
    mrr: number;
  };
  payments: {
    total: number;
    confirmed: number;
    conversion_rate: number;
  };
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  [key: string]: T[] | number;
}
