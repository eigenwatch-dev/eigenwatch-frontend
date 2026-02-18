export type UserTier = "free" | "pro" | "enterprise";
export type AuthTier = "anonymous" | UserTier;
export type AuthStep = "sign" | "email" | "verify" | "complete";

export interface User {
  id: string;
  wallet_address: string;
  tier: UserTier;
  display_name?: string;
  emails?: UserEmail[];
  created_at: string;
}

export interface UserEmail {
  id: string;
  email: string;
  is_verified: boolean;
  is_primary: boolean;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_agent?: string;
  ip_address?: string;
  last_active_at: string;
  created_at: string;
  is_current: boolean;
}

export interface UserPreferences {
  risk_alerts_operator_changes: boolean;
  risk_alerts_slashing: boolean;
  risk_alerts_tvs_changes: boolean;
  watchlist_daily_summary: boolean;
  watchlist_status_changes: boolean;
  product_updates: boolean;
  newsletter: boolean;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface NonceResponse {
  nonce: string;
  message: string;
}

export interface VerifyResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}
