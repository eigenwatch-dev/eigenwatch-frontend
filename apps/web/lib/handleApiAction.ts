/* eslint-disable @typescript-eslint/no-explicit-any */
// ==================== lib/handleApiAction.ts ====================
"use server";

import api from "@/lib/api";
import { handleSuccess, handleError } from "@/lib/utils";
import { ApiResponse, AppApiResponse } from "@/types/api.types";

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
    const response =
      method === "get"
        ? await api.get(endpoint)
        : await api[method](endpoint, body);

    const data = response.data;

    if (!data.success) {
      return handleError<T>(data.error, true);
    }

    return handleSuccess<T>(data, successMessage);
  } catch (error: any) {
    return handleError<T>(error);
  }
}
