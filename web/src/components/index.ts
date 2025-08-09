// Export all authentication-related components
export { LoginForm } from "./forms/LoginForm";
export { RegisterForm } from "./forms/RegisterForm";
export { UserProfile } from "./user/UserProfile";
export { BookingHistory } from "./user/BookingHistory";
export { PrivateRoute } from "./auth/PrivateRoute";
export { SessionWarning } from "./auth/SessionWarning";
export { AuthButton } from "./auth/AuthButton";
export { ProtectedContent } from "./auth/ProtectedContent";
export { UserWelcome } from "./auth/UserWelcome";
export { ErrorBoundary } from "./common/ErrorBoundary";

// Export booking components
export { BookingFlow } from "./booking/BookingFlow";
export { BookingDetails } from "./booking/BookingDetails";
export { UserBookings } from "./booking/UserBookings";

// Export UI components
export { Button } from "./ui/Button";
export { Card } from "./ui/Card";
export { Modal } from "./ui/Modal";
export { NotificationBanner } from "./ui/NotificationBanner";
export { Input } from "./ui/Input";
export { LoadingSkeleton } from "./ui/LoadingSkeleton";

// Export layout components
export { Layout } from "./layout/Layout";
export { Header } from "./layout/Header";
export { Footer } from "./layout/Footer";
export { PageLayout } from "./layout/PageLayout";

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
