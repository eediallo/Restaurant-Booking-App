import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

export const AuthButton: React.FC = () => {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowUserMenu(false);
        setShowLogoutModal(false);
      }
    };

    if (showUserMenu || showLogoutModal) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showUserMenu, showLogoutModal]);

  const handleLogout = async () => {
    try {
      console.log("Starting logout process...");
      setIsLoggingOut(true);
      await logout();
      console.log("Logout successful, closing modal and navigating...");
      setShowLogoutModal(false);
      setShowUserMenu(false);
      // Navigate to home page after logout
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails on server, clear local state
      setShowLogoutModal(false);
      setShowUserMenu(false);
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <Link to="/login">
          <Button variant="ghost" size="sm">
            Login
          </Button>
        </Link>
        <Link to="/register">
          <Button variant="primary" size="sm">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-2 hover:bg-gray-100"
        >
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {user.first_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
          </div>
          <span className="text-gray-700 font-medium hidden sm:block">
            {user.first_name || user.email}
          </span>
          <svg
            className="h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setShowUserMenu(false)}
            >
              Profile Settings
            </Link>
            <Link
              to="/my-bookings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setShowUserMenu(false)}
            >
              My Bookings
            </Link>
            <hr className="my-1" />
            <button
              onClick={() => {
                setShowUserMenu(false);
                setShowLogoutModal(true);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={isLoggingOut ? () => {} : () => setShowLogoutModal(false)}
        title="Confirm Sign Out"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to sign out of your account?
          </p>
          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowLogoutModal(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Signing Out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};
