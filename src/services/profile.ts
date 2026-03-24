import { api } from "./api";
import type { ApiResponse, ProfileResponse, SupportedCurrency } from "../types/api";

export async function getProfile() {
  const response = await api.get<ApiResponse<ProfileResponse>>("/profile");
  return response.data.data;
}

export async function updateProfileRequest(payload: {
  displayName: string;
  avatarUrl?: string | null;
  preferredCurrency: SupportedCurrency;
}) {
  const response = await api.put<ApiResponse<ProfileResponse>>("/profile", payload);
  return response.data.data;
}
