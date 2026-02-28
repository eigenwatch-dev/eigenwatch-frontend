"use server";
import { cookies } from "next/headers";

const BASE_URL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;

export async function getEnvVariables() {
  return { BASE_URL, API_KEY };
}

export async function setAuthCookie(token: string) {
  await clearAuthCookie();
  (await cookies()).set("access_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes in seconds
  });
}

export async function getAccessToken() {
  return (await cookies()).get("access_token")?.value;
}

export async function clearAuthCookie() {
  try {
    (await cookies()).delete("access_token");
  } catch (error) {
    console.log("Failed to delete access token cookie:", error);
  }
}
