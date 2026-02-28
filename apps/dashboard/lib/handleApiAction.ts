/* eslint-disable @typescript-eslint/no-explicit-any */
// ==================== lib/handleApiAction.ts ====================
"use server";

import api from "@/lib/api";
import { handleSuccess, handleError } from "@/lib/utils";
import { ApiResponse, AppApiResponse } from "@/types/api.types";
import { getAccessToken } from "@/actions/utils";
import { refreshAccessTokenAction } from "@/actions/auth";

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
    // 1. Try to get the existing access token
    let accessToken = await getAccessToken();

    // 2. If token is missing, attempt a refresh proactively
    if (!accessToken) {
      console.log(
        `Access token missing for ${endpoint}, attempting refresh...`,
      );
      const refreshResult = await refreshAccessTokenAction();
      if (refreshResult.success) {
        accessToken = refreshResult.accessToken;
      }
    }

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    let response;
    try {
      response =
        method === "get"
          ? await api.get(endpoint, { headers })
          : await api[method](endpoint, body, { headers });
    } catch (error: any) {
      // 3. If 401 Unauthorized, try refreshing once and retry
      if (error.response?.status === 401) {
        console.log(
          `401 Unauthorized for ${endpoint}, attempting refresh and retry...`,
        );
        const refreshResult = await refreshAccessTokenAction();
        if (refreshResult.success) {
          const newHeaders = {
            ...headers,
            Authorization: `Bearer ${refreshResult.accessToken}`,
          };
          response =
            method === "get"
              ? await api.get(endpoint, { headers: newHeaders })
              : await api[method](endpoint, body, { headers: newHeaders });
        } else {
          // Refresh failed, propagate the original error
          throw error;
        }
      } else {
        throw error;
      }
    }

    const data = response.data;

    if (!data.success) {
      return handleError<T>(data.error, true);
    }

    return handleSuccess<T>(data, successMessage);
  } catch (error: any) {
    return handleError<T>(error);
  }
}
