import { create } from "zustand";
import type { AuthUser } from "../types/api";
import { clearAuthSession, getAccessToken, getStoredUser, saveStoredUser, setAuthSession } from "../utils/storage";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  setSession: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: getAccessToken(),
  user: getStoredUser(),
  setSession: (accessToken, refreshToken, user) => {
    const nextUser = {
      ...user,
      avatarUrl: user.avatarUrl ?? null,
      preferredCurrency: user.preferredCurrency ?? "INR",
    };
    setAuthSession(accessToken, refreshToken, nextUser);
    set({ accessToken, user: nextUser });
  },
  updateProfile: (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const nextUser = { ...currentUser, ...updates };
    saveStoredUser(nextUser);
    set({ user: nextUser });
  },
  logout: () => {
    clearAuthSession();
    set({ accessToken: null, user: null });
  },
}));
