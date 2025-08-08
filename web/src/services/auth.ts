import api from "./api";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  User,
} from "../types";

export const authService = {
  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/api/auth/register",
      userData
    );
    return response.data;
  },

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/api/auth/login",
      credentials
    );
    return response.data;
  },

  // Refresh access token
  async refreshToken(
    refreshTokenData: RefreshTokenRequest
  ): Promise<{ access_token: string }> {
    const response = await api.post<{ access_token: string }>(
      "/api/auth/refresh",
      refreshTokenData
    );
    return response.data;
  },

  // Get current user info
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/api/auth/me");
    return response.data;
  },

  // Logout user
  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/api/auth/logout");
    return response.data;
  },

  // Get user profile
  async getUserProfile(): Promise<User> {
    const response = await api.get<User>("/api/user/profile");
    return response.data;
  },

  // Update user profile
  async updateUserProfile(updates: Partial<User>): Promise<User> {
    const response = await api.patch<User>("/api/user/profile", updates);
    return response.data;
  },

  // Delete user account
  async deleteAccount(): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>("/api/user/account");
    return response.data;
  },
};
