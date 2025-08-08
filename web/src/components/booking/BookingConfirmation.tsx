import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/Button";
import type { User } from "../../types";

interface BookingConfirmationProps {
  visitDate: string;
  visitTime: string;
  partySize: number;
  user: User;
  onConfirm: (specialRequests: string) => Promise<void>;
  isLoading: boolean;
}

interface ConfirmationFormData {
  specialRequests: string;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  visitDate,
  visitTime,
  partySize,
  user,
  onConfirm,
  isLoading,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmationFormData>();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const onSubmit = async (data: ConfirmationFormData) => {
    setIsConfirming(true);
    try {
      await onConfirm(data.specialRequests || "");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review Your Booking
        </h2>
        <p className="text-gray-600">
          Please review your reservation details and confirm your booking.
        </p>
      </div>

      {/* Booking Details */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reservation Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p className="text-lg text-gray-900">{formatDate(visitDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Time</label>
              <p className="text-lg text-gray-900">{visitTime}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Party Size
              </label>
              <p className="text-lg text-gray-900">
                {partySize} {partySize === 1 ? "person" : "people"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Restaurant
              </label>
              <p className="text-lg text-gray-900">TheHungryUnicorn</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Booking Channel
              </label>
              <p className="text-lg text-gray-900">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Customer Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg text-gray-900">
                {user.first_name} {user.last_name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg text-gray-900">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-lg text-gray-900">{user.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Username
              </label>
              <p className="text-lg text-gray-900">{user.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Special Requests Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="specialRequests"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Special Requests (Optional)
          </label>
          <textarea
            id="specialRequests"
            rows={4}
            {...register("specialRequests", {
              maxLength: {
                value: 500,
                message: "Special requests must be 500 characters or less",
              },
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Let us know about any dietary restrictions, celebrations, accessibility needs, or other special requests..."
          />
          {errors.specialRequests && (
            <p className="text-red-500 text-sm mt-1">
              {errors.specialRequests.message}
            </p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">
            Booking Terms & Conditions
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Please arrive within 15 minutes of your reservation time</li>
            <li>• Cancellations must be made at least 2 hours in advance</li>
            <li>• Large party bookings may require a deposit</li>
            <li>• We reserve tables for 2 hours during peak times</li>
          </ul>
        </div>

        {/* Confirmation Button */}
        <div className="pt-4">
          <Button
            type="submit"
            loading={isConfirming || isLoading}
            className="w-full py-4 text-lg"
            size="lg"
          >
            {isConfirming || isLoading
              ? "Confirming Booking..."
              : "Confirm Reservation"}
          </Button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Your booking will be processed securely. You will receive a
          confirmation email shortly.
        </p>
      </div>
    </div>
  );
};
