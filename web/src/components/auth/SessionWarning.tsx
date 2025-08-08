import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { tokenUtils } from "../../utils/token";
import { Button } from "../ui/Button";

interface SessionWarningProps {
  warningThreshold?: number; // Minutes before expiration to show warning
}

export const SessionWarning: React.FC<SessionWarningProps> = ({
  warningThreshold = 5,
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number>(0);
  const { refreshToken, logout } = useAuth();

  useEffect(() => {
    const checkTokenExpiry = () => {
      const accessToken = tokenUtils.getAccessToken();

      if (!accessToken) {
        setShowWarning(false);
        return;
      }

      const timeLeft = tokenUtils.getTokenTimeUntilExpiry(accessToken);
      const warningThresholdSeconds = warningThreshold * 60;

      if (timeLeft > 0 && timeLeft <= warningThresholdSeconds) {
        setShowWarning(true);
        setTimeUntilExpiry(timeLeft);
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Check every 30 seconds
    const interval = setInterval(checkTokenExpiry, 30000);

    return () => clearInterval(interval);
  }, [warningThreshold]);

  const handleExtendSession = async () => {
    try {
      await refreshToken();
      setShowWarning(false);
    } catch (error) {
      console.error("Failed to refresh token:", error);
      // If refresh fails, logout the user
      logout();
    }
  };

  const handleLogout = () => {
    logout();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!showWarning) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-200 p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Session expiring soon!</span> Your
              session will expire in{" "}
              <span className="font-mono font-bold">
                {formatTime(timeUntilExpiry)}
              </span>
              .
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            size="sm"
            onClick={handleExtendSession}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Extend Session
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleLogout}
            className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
