// Export all authentication-related components
export { LoginForm } from "./forms/LoginForm";
export { RegisterForm } from "./forms/RegisterForm";
export { UserProfile } from "./user/UserProfile";
export { PrivateRoute } from "./auth/PrivateRoute";
export { SessionWarning } from "./auth/SessionWarning";
export { ErrorBoundary } from "./common/ErrorBoundary";

// Export authentication context and hooks
export { useAuth } from "../hooks/useAuth";
export { AuthProvider, AuthContext } from "../contexts/AuthContext";

// Export types
export type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthContextType,
} from "../types";
