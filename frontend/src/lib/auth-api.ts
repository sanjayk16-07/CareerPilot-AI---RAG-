import { apiClient } from "@/lib/api-client";
import type {
  AuthToken,
  AuthUser,
  ForgotPasswordResponse,
  LoginPayload,
  RegisterPayload
} from "@/types/auth";

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<AuthToken>("/auth/login", payload);
  return response.data;
}

export async function register(payload: RegisterPayload) {
  const response = await apiClient.post<AuthToken>("/auth/register", payload);
  return response.data;
}

export async function logout() {
  await apiClient.post("/auth/logout");
}

export async function getProfile() {
  const response = await apiClient.get<AuthUser>("/auth/me");
  return response.data;
}

export async function forgotPassword(email: string) {
  const response = await apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", {
    email
  });
  return response.data;
}

export async function resetPassword(token: string, password: string) {
  const response = await apiClient.post<AuthUser>("/auth/reset-password", {
    token,
    password
  });
  return response.data;
}

