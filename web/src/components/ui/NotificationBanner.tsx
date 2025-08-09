import React, { useEffect, useState } from "react";

interface NotificationBannerProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  description?: string;
  isVisible: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  type,
  message,
  description,
  isVisible,
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
  actionButton,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);

      if (autoClose && autoCloseDelay > 0) {
        const timer = setTimeout(() => {
          onClose?.();
        }, autoCloseDelay);

        return () => clearTimeout(timer);
      }
    } else {
      setIsAnimating(false);
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose]);

  const typeStyles = {
    success: {
      container: "bg-green-50 border-green-200",
      icon: "text-green-400",
      text: "text-green-800",
      button: "text-green-600 hover:text-green-500",
      iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    error: {
      container: "bg-red-50 border-red-200",
      icon: "text-red-400",
      text: "text-red-800",
      button: "text-red-600 hover:text-red-500",
      iconPath:
        "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200",
      icon: "text-yellow-400",
      text: "text-yellow-800",
      button: "text-yellow-600 hover:text-yellow-500",
      iconPath:
        "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z",
    },
    info: {
      container: "bg-blue-50 border-blue-200",
      icon: "text-blue-400",
      text: "text-blue-800",
      button: "text-blue-600 hover:text-blue-500",
      iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  };

  const styles = typeStyles[type];

  if (!isVisible && !isAnimating) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`rounded-lg border p-4 shadow-lg max-w-md ${styles.container}`}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className={`h-5 w-5 ${styles.icon}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={styles.iconPath}
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${styles.text}`}>{message}</h3>
            {description && (
              <div className={`mt-1 text-sm ${styles.text}`}>{description}</div>
            )}
            {actionButton && (
              <div className="mt-3">
                <button
                  type="button"
                  className={`text-sm font-medium ${styles.button} hover:underline`}
                  onClick={actionButton.onClick}
                >
                  {actionButton.label}
                </button>
              </div>
            )}
          </div>
          {onClose && (
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  className={`inline-flex rounded-md p-1.5 ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type}-50 focus:ring-${type}-600`}
                  onClick={onClose}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
