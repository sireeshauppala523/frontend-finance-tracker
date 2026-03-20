import { create } from "zustand";
import type { AuthUser } from "../types/api";
import { clearAuthSession, getAccessToken, getStoredUser, getUserProfile, saveStoredUser, saveUserProfile, setAuthSession } from "../utils/storage";

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
    const savedProfile = getUserProfile(user.email);
    const nextUser = {
      ...user,
      displayName: savedProfile?.displayName ?? user.displayName,
      avatarUrl: savedProfile?.avatarUrl ?? user.avatarUrl ?? null,
      preferredCurrency: savedProfile?.preferredCurrency ?? user.preferredCurrency ?? "INR",
    };
    setAuthSession(accessToken, refreshToken, nextUser);
    saveUserProfile(nextUser.email, {
      displayName: nextUser.displayName,
      avatarUrl: nextUser.avatarUrl ?? null,
      preferredCurrency: nextUser.preferredCurrency,
    });
    set({ accessToken, user: nextUser });
  },
  updateProfile: (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const nextUser = { ...currentUser, ...updates };
    saveStoredUser(nextUser);
    saveUserProfile(nextUser.email, {
      displayName: nextUser.displayName,
      avatarUrl: nextUser.avatarUrl ?? null,
      preferredCurrency: nextUser.preferredCurrency,
    });
    set({ user: nextUser });
  },
  logout: () => {
    clearAuthSession();
    set({ accessToken: null, user: null });
  },
}));