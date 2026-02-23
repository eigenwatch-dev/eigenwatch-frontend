/* eslint-disable @typescript-eslint/no-explicit-any */
// ==================== lib/handleApiAction.ts ====================
"use server";

import api from "@/lib/api";
import { handleSuccess, handleError } from "@/lib/utils";
import { ApiResponse, AppApiResponse } from "@/types/api.types";
import { getAccessToken } from "@/actions/utils";

interface ApiActionOptions {
  endpoint: string;
  method?: "get" | "post" | "put" | "patch" | "delete";
  body?: any;
  successMessage?: string;
}

export async function handleApiAction<T = any>({
  endpoint,
  method = "post",
  body,
  successMessage,
}: ApiActionOptions): Promise<AppApiResponse<ApiResponse<T>>> {
  try {
    // Read the access token from the httpOnly cookie to forward auth to the backend
    const accessToken = await getAccessToken();
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response =
      method === "get"
        ? await api.get(endpoint, { headers })
        : await api[method](endpoint, body, { headers });

    const data = response.data;

    console.log(`API Response for ${endpoint}:`, data);

    if (!data.success) {
      return handleError<T>(data.error, true);
    }

    return handleSuccess<T>(data, successMessage);
  } catch (error: any) {
    return handleError<T>(error);
  }
}
