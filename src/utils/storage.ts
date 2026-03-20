import type { AuthUser, SupportedCurrency } from "../types/api";

const ACCESS_TOKEN_KEY = "pft_access_token";
const REFRESH_TOKEN_KEY = "pft_refresh_token";
const USER_KEY = "pft_user";
const PROFILE_MAP_KEY = "pft_profile_map";

type StoredProfile = {
  displayName?: string;
  avatarUrl?: string | null;
  preferredCurrency?: SupportedCurrency;
};

function getProfileMap(): Record<string, StoredProfile> {
  const raw = localStorage.getItem(PROFILE_MAP_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveProfileMap(map: Record<string, StoredProfile>) {
  localStorage.setItem(PROFILE_MAP_KEY, JSON.stringify(map));
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAuthSession(accessToken: string, refreshToken: string, user: AuthUser) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function saveStoredUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function saveUserProfile(email: string, profile: StoredProfile) {
  const map = getProfileMap();
  map[email.toLowerCase()] = {
    ...map[email.toLowerCase()],
    ...profile,
  };
  saveProfileMap(map);
}

export function getUserProfile(email: string): StoredProfile | null {
  const map = getProfileMap();
  return map[email.toLowerCase()] ?? null;
}

export function getPreferredCurrency(): SupportedCurrency {
  const user = getStoredUser();
  return user?.preferredCurrency ?? "INR";
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}