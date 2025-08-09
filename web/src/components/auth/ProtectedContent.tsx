import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface ProtectedContentProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  showLoginButton?: boolean;
  loading?: boolean;
}

export const ProtectedContent: React.FC<ProtectedContentProps> = ({
  children,
  fallbackTitle = "Authentication Required",
  fallbackMessage = "Please sign in to access this content.",
  showLoginButton = true,
  loading = false,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading || loading) {
    return (
      <Card className="text-center">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="text-center">
        <div className="py-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 0h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2zm10-12V6a2 2 0 00-2-2H8a2 2 0 00-2 2v3m8 0V6a2 2 0 00-2-2H8a2 2 0 00-2 2v3"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {fallbackTitle}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {fallbackMessage}
          </p>
          {showLoginButton && (
            <div className="flex justify-center space-x-3">
              <Link to="/login">
                <Button variant="primary">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline">Create Account</Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return <>{children}</>;
};
