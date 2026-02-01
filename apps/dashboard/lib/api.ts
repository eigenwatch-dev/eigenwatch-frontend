// ==================== lib/api.ts ====================
"use server";
import axios from "axios";

const BASE_URL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

// Add response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API Request Failed:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  },
);

export default api;
