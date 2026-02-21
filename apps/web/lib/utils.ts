/* eslint-disable @typescript-eslint/no-explicit-any */
// ==================== lib/utils.ts ====================
import { ApiResponse, AppApiResponse } from "@/types/api.types";

export function handleError<T = any>(
  error: any,
  isErrResponse?: boolean,
): AppApiResponse<ApiResponse<T>> {
  const safeResponse = error?.response
    ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
        method: error.config?.method,
      }
    : error?.message || "Unknown error";

  console.log("API Error:", JSON.stringify(safeResponse, null, 2));

  const errorCode = safeResponse?.data?.error?.errorCode;
  let message: string =
    error.response?.data?.data?.errorDescription ||
    error.response?.data?.message ||
    error.message ||
    "Something went wrong";

  message =
    errorCode === "UNKNOWN_APP_ERROR"
      ? "An unexpected error occurred. Please try again."
      : message;

  return {
    message: isErrResponse ? error.errorDescription : message,
    success: false,
    error: isErrResponse ? error : error.response?.data,
    errorCode,
    data: null,
  };
}

export function handleSuccess<T = any>(
  data: any,
  message?: string,
): AppApiResponse<ApiResponse<T>> {
  return {
    success: true,
    data: data,
    error: null,
    errorCode: undefined,
    message: data?.message || message || "Action completed successfully",
  };
}
