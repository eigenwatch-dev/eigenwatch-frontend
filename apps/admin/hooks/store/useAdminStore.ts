import { create } from "zustand";

interface AdminState {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  token: null,
  isAuthenticated: false,

  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_token", token);
    }
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
    }
    set({ token: null, isAuthenticated: false });
  },

  hydrate: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (token) {
        set({ token, isAuthenticated: true });
      }
    }
  },
}));
