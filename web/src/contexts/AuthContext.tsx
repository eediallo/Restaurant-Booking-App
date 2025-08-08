import React, {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService } from "../services/auth";
import { tokenUtils } from "../utils/token";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthContextType,
} from "../types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenUtils.getAccessToken();
      const storedUser = tokenUtils.getUserInfo();

      if (token && storedUser) {
        try {
          setUser(storedUser);
          // Verify token is still valid by fetching current user
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          tokenUtils.setUserInfo(currentUser);
        } catch (error) {
          console.error("Auth initialization failed:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      const { access_token, refresh_token, user_info } = response;

      // Store tokens and user info
      tokenUtils.setTokens(access_token, refresh_token);
      tokenUtils.setUserInfo(user_info);

      setUser(user_info);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);

      const { access_token, refresh_token, user_info } = response;

      // Store tokens and user info
      tokenUtils.setTokens(access_token, refresh_token);
      tokenUtils.setUserInfo(user_info);

      setUser(user_info);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    // Clear stored auth data
    tokenUtils.clearTokens();

    setUser(null);

    // Call logout endpoint (optional, for server-side cleanup)
    authService.logout().catch(console.error);
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const storedRefreshToken = tokenUtils.getRefreshToken();
      if (!storedRefreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await authService.refreshToken({
        refresh_token: storedRefreshToken,
      });

      tokenUtils.setAccessToken(response.access_token);
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
