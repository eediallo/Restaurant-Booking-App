import { api } from "./api";
import type { AuthResponse, AuthUser, ProfileData, UserData } from "../types";

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/auth/login", {
      username: email, // Backend expects username field but uses email
      password,
    });
    return response.data;
  }

  async register(userData: UserData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/auth/register", userData);
    return response.data;
  }

  async logout() {
    const response = await api.post("/api/auth/logout");
    return response.data;
  }

  async getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<AuthUser>("/api/auth/me");
    return response.data;
  }

  async updateProfile(profileData: ProfileData): Promise<AuthUser> {
    const response = await api.patch<AuthUser>("/api/user/profile", profileData);
    return response.data;
  }

  async refreshToken(refreshToken: string) {
    const response = await api.post<{ access_token: string }>("/api/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  // Helper method to check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem("accessToken");
    if (!token) return false;

    try {
      // Check if token is expired (basic check)
      const payload: unknown = JSON.parse(atob(token.split(".")[1] ?? ""));
      if (typeof payload !== "object" || payload === null || !("exp" in payload)) {
        return false;
      }
      const expiration = payload.exp;
      const currentTime = Date.now() / 1000;
      return typeof expiration === "number" && expiration > currentTime;
    } catch {
      return false;
    }
  }

  // Get stored token
  getToken() {
    return localStorage.getItem("accessToken");
  }

  // Clear authentication data
  clearAuth() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
}

export const authService = new AuthService();
