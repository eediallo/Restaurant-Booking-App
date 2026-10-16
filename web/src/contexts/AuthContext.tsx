import React, { useEffect, useState, useContext, createContext } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/auth";

export interface AuthUser {
  id?: string | number;
  username?: string;
  email?: string;
  first_name?: string;
  [key: string]: any;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: Record<string, unknown>) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Record<string, unknown>) => Promise<AuthUser>;
  refreshToken: () => Promise<string>;
  isAuthenticated: () => boolean;
  clearError: () => void;
}

interface AuthProviderProps { children: ReactNode }

// Create the AuthContext
const AuthContext = createContext<AuthContextValue | null>(null);

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token && authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Only clear tokens if it's an authentication error (401)
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(email, password);

      // Store tokens
      localStorage.setItem("accessToken", response.access_token);
      localStorage.setItem("refreshToken", response.refresh_token);

      // Set user data immediately from login response
      setUser(response.user_info);

      return response;
    } catch (error) {
      setError(error.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Record<string, unknown>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(userData);

      // Store tokens
      localStorage.setItem("accessToken", response.access_token);
      localStorage.setItem("refreshToken", response.refresh_token);

      // Set user data
      setUser(response.user_info);

      return response;
    } catch (error) {
      setError(error.message || "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  const updateProfile = async (profileData: Record<string, unknown>) => {
    try {
      setLoading(true);
      setError(null);

      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);

      return updatedUser;
    } catch (error) {
      setError(error.message || "Profile update failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await authService.refreshToken(refreshToken);
      localStorage.setItem("accessToken", response.access_token);

      return response.access_token;
    } catch (error) {
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem("accessToken");
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
    isAuthenticated,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
