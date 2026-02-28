"use server";

import api from "@/lib/api";
import { setAuthCookie } from "./utils";
import { cookies } from "next/headers";

/**
 * Server action to refresh the access token using the refresh_token cookie.
 * This is called by handleApiAction when the access token is missing or expired.
 */
export async function refreshAccessTokenAction() {
  try {
    const refreshToken = (await cookies()).get("refresh_token")?.value;

    if (!refreshToken) {
      return { success: false, error: "No refresh token available" };
    }

    // Call backend refresh endpoint
    const response = await api.post(
      "/api/v1/auth/refresh",
      {},
      {
        headers: {
          // Axios doesn't automatically send cookies in server-side requests
          // so we manually pass it if needed, but the backend also checks the cookie.
          // However, since this is a server action calling our own API,
          // we can pass the cookie in headers.
          Cookie: `refresh_token=${refreshToken}`,
        },
      },
    );

    const data = response.data;

    if (data.success && data.data?.tokens?.access_token) {
      const newToken = data.data.tokens.access_token;
      await setAuthCookie(newToken);
      return { success: true, accessToken: newToken };
    }

    return { success: false, error: "Failed to refresh token" };
  } catch (error: any) {
    console.error(
      "Token refresh action failed:",
      error.response?.data || error.message,
    );
    return { success: false, error: "Token refresh failed" };
  }
}
