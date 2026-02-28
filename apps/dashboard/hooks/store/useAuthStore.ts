import { create } from "zustand";
import { User, AuthTier, AuthStep } from "@/types/auth.types";

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  isRestoring: boolean;
  tier: AuthTier;
  showAuthModal: boolean;
  authStep: AuthStep;

  // Actions
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setAuthenticating: (val: boolean) => void;
  setRestoring: (val: boolean) => void;
  openAuthModal: (step?: AuthStep) => void;
  closeAuthModal: () => void;
  setAuthStep: (step: AuthStep) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isAuthenticating: false,
  isRestoring: true,
  tier: "FREE",
  showAuthModal: false,
  authStep: "sign",

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      tier: user?.tier || "FREE",
    }),

  setAccessToken: (accessToken) => set({ accessToken }),

  setAuthenticating: (isAuthenticating) => set({ isAuthenticating }),

  setRestoring: (isRestoring) => set({ isRestoring }),

  openAuthModal: (step?: AuthStep) =>
    set({ showAuthModal: true, authStep: step || "sign" }),

  closeAuthModal: () => set({ showAuthModal: false, isAuthenticating: false }),

  setAuthStep: (authStep) => set({ authStep }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isAuthenticating: false,
      tier: "FREE",
      showAuthModal: false,
      authStep: "sign",
    }),
}));

export default useAuthStore;
