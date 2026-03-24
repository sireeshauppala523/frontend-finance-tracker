import { api } from "./api";
import type { ApiResponse, AuthResponse } from "../types/api";

export async function login(payload: { email: string; password: string }) {
  const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", payload);
  return response.data.data;
}

export async function register(payload: { email: string; password: string; displayName: string; preferredCurrency: string }) {
  const response = await api.post<ApiResponse<AuthResponse>>("/auth/register", payload);
  return response.data.data;
}
