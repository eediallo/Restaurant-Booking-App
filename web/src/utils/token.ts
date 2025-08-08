// Token management utilities
import type { User } from "../types";

interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

export const tokenUtils = {
  // Get access token from localStorage
  getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  },

  // Get refresh token from localStorage
  getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  },

  // Set tokens in localStorage
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  },

  // Set only access token (for refresh operations)
  setAccessToken(accessToken: string): void {
    localStorage.setItem("access_token", accessToken);
  },

  // Clear all tokens from localStorage
  clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },

  // Check if user is authenticated (has valid tokens)
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return !!(accessToken && refreshToken);
  },

  // Parse JWT token to get payload (without verification)
  parseJwtPayload(token: string): JwtPayload | null {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  },

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    const payload = this.parseJwtPayload(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  },

  // Check if access token is expired
  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    return this.isTokenExpired(token);
  },

  // Check if refresh token is expired
  isRefreshTokenExpired(): boolean {
    const token = this.getRefreshToken();
    if (!token) return true;
    return this.isTokenExpired(token);
  },

  // Get time until token expires (in seconds)
  getTokenTimeUntilExpiry(token: string): number {
    const payload = this.parseJwtPayload(token);
    if (!payload || !payload.exp) {
      return 0;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - currentTime);
  },

  // Check if token expires within a certain timeframe (in seconds)
  willTokenExpireSoon(token: string, thresholdSeconds: number = 300): boolean {
    const timeUntilExpiry = this.getTokenTimeUntilExpiry(token);
    return timeUntilExpiry <= thresholdSeconds;
  },

  // Check if access token expires soon (default: 5 minutes)
  willAccessTokenExpireSoon(thresholdSeconds: number = 300): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    return this.willTokenExpireSoon(token, thresholdSeconds);
  },

  // Get user info from localStorage
  getUserInfo(): User | null {
    const userStr = localStorage.getItem("user");
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Set user info in localStorage
  setUserInfo(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  },

  // Clear user info from localStorage
  clearUserInfo(): void {
    localStorage.removeItem("user");
  },

  // Check if we should attempt token refresh
  shouldRefreshToken(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return false;
    }

    // Don't refresh if refresh token is expired
    if (this.isRefreshTokenExpired()) {
      return false;
    }

    // Refresh if access token is expired or expires soon
    return this.isAccessTokenExpired() || this.willAccessTokenExpireSoon();
  },
};
