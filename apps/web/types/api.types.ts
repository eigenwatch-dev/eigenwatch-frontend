/* eslint-disable @typescript-eslint/no-explicit-any */
// ==================== BASE TYPES ====================

export interface AppApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message?: string;
  error?: any;
  errorCode?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta: {
    request_id: string;
    timestamp: string;
    execution_time_ms: number;
  };
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
    next_offset: number;
  };
}
