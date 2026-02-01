// ==================== lib/utils.ts ====================
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse, AppApiResponse } from "@/types/api.types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const initials = parts.map((part) => part[0]?.toUpperCase() || "").join("");
  return initials;
}

export function deepMerge(target: any, source: any) {
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

export function serializeParams(params: Record<string, any>): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}
