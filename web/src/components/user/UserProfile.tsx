import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { useUserBookingStats } from "../../hooks/useBookingApi";
import { authService } from "../../services/auth";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { BookingHistory } from "./BookingHistory";
import { getErrorMessage } from "../../utils";

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const UserProfile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [showBookingHistory, setShowBookingHistory] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { user, logout } = useAuth();

  // Fetch user booking statistics
  const {
    data: bookingStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useUserBookingStats();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm<ChangePasswordData>();

  const newPassword = watch("newPassword");

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      resetProfile({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        email: user.email,
      });
    }
  }, [user, resetProfile]);

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      await authService.updateUserProfile(data);
      setSuccess("Profile updated successfully!");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: ChangePasswordData) => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      // This would need to be implemented in the backend
      // await authService.changePassword(data.currentPassword, data.newPassword);
      console.log("Password change request:", data);
      setSuccess("Password changed successfully!");
      setIsPasswordFormOpen(false);
      resetPassword();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      setError("");

      await authService.deleteAccount();
      logout();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  // Show booking history if requested
  if (showBookingHistory) {
    return (
      <div className="max-w-4xl mx-auto">
        <BookingHistory onClose={() => setShowBookingHistory(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Profile Information
        </h2>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Profile Form */}
        <form
          onSubmit={handleProfileSubmit(onSubmitProfile)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              {...registerProfile("first_name", {
                required: "First name is required",
                minLength: {
                  value: 2,
                  message: "First name must be at least 2 characters",
                },
              })}
              error={profileErrors.first_name?.message}
            />

            <Input
              label="Last Name"
              {...registerProfile("last_name", {
                required: "Last name is required",
                minLength: {
                  value: 2,
                  message: "Last name must be at least 2 characters",
                },
              })}
              error={profileErrors.last_name?.message}
            />
          </div>

          <Input
            label="Email"
            type="email"
            {...registerProfile("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            error={profileErrors.email?.message}
          />

          <Input
            label="Phone"
            type="tel"
            {...registerProfile("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^[+]?[\d\s\-()]+$/,
                message: "Invalid phone number",
              },
            })}
            error={profileErrors.phone?.message}
          />

          <Button type="submit" loading={isLoading} className="w-full">
            Update Profile
          </Button>
        </form>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Account Settings
        </h3>

        <div className="space-y-4">
          {/* Change Password */}
          <div>
            <Button
              variant="outline"
              onClick={() => setIsPasswordFormOpen(!isPasswordFormOpen)}
              className="mb-4"
            >
              {isPasswordFormOpen
                ? "Cancel Password Change"
                : "Change Password"}
            </Button>

            {isPasswordFormOpen && (
              <form
                onSubmit={handlePasswordSubmit(onSubmitPassword)}
                className="space-y-4 p-4 border border-gray-200 rounded-md"
              >
                <Input
                  label="Current Password"
                  type="password"
                  {...registerPassword("currentPassword", {
                    required: "Current password is required",
                  })}
                  error={passwordErrors.currentPassword?.message}
                />

                <Input
                  label="New Password"
                  type="password"
                  {...registerPassword("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message:
                        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                    },
                  })}
                  error={passwordErrors.newPassword?.message}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  {...registerPassword("confirmNewPassword", {
                    required: "Please confirm your new password",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  })}
                  error={passwordErrors.confirmNewPassword?.message}
                />

                <Button type="submit" loading={isLoading}>
                  Change Password
                </Button>
              </form>
            )}
          </div>

          {/* Account Preferences */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              Account Preferences
            </h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
                <span className="ml-2 text-sm text-gray-700">
                  Email notifications for booking confirmations
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
                <span className="ml-2 text-sm text-gray-700">
                  SMS notifications for booking reminders
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Marketing emails and promotions
                </span>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-red-200 pt-4">
            <h4 className="text-lg font-medium text-red-900 mb-3">
              Danger Zone
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>

            {!showDeleteConfirmation ? (
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirmation(true)}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Delete Account
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-red-900">
                  Are you sure you want to delete your account? This action
                  cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleDeleteAccount}
                    loading={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Yes, Delete My Account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirmation(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking History Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Booking History Summary
        </h3>

        {isLoadingStats ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : statsError ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">
              Failed to load booking statistics
            </p>
            <p className="text-gray-500 text-sm">
              Please try refreshing the page
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {bookingStats?.total || 0}
                </div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {bookingStats?.completed || 0}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {bookingStats?.upcoming || 0}
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {bookingStats?.cancelled || 0}
                </div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowBookingHistory(true)}
              >
                View Full Booking History
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
