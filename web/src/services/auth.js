import { api } from "./api";

class AuthService {
  async login(email, password) {
    const response = await api.post("/api/auth/login", {
      username: email, // Backend expects username field but uses email
      password,
    });
    return response.data;
  }

  async register(userData) {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  }

  async logout() {
    const response = await api.post("/api/auth/logout");
    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get("/api/auth/me");
    return response.data;
  }

  async updateProfile(profileData) {
    const response = await api.patch("/api/user/profile", profileData);
    return response.data;
  }

  async refreshToken(refreshToken) {
    const response = await api.post("/api/auth/refresh", {
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
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
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
