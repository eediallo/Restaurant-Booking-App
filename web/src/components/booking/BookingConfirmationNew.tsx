import React, { useState } from "react";
import { useForm } from "react-hook-form";
import type { CustomerDetailsFormData } from "./CustomerDetailsForm";

interface BookingConfirmationProps {
  visitDate: string;
  visitTime: string;
  partySize: number;
  customerDetails: CustomerDetailsFormData;
  onConfirm: () => Promise<void>;
  onEdit: (step: "date" | "time" | "customer") => void;
  isLoading: boolean;
}

interface ConfirmationFormData {
  termsAccepted: boolean;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  visitDate,
  visitTime,
  partySize,
  customerDetails,
  onConfirm,
  onEdit,
  isLoading,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ConfirmationFormData>({
    defaultValues: {
      termsAccepted: false,
    },
    mode: "onChange",
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const onSubmit = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Confirmation
        </h2>
        <p className="text-gray-600">
          Please review your booking details before confirming your reservation.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Restaurant and Booking Details */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Restaurant Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl mb-2">🏪</div>
              <h4 className="font-medium text-gray-900">Restaurant</h4>
              <p className="text-gray-600">The Hungry Unicorn</p>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">📅</div>
              <h4 className="font-medium text-gray-900">Date & Time</h4>
              <p className="text-gray-600">{formatDate(visitDate)}</p>
              <p className="text-gray-600 font-medium">
                {formatTime(visitTime)}
              </p>
              <button
                type="button"
                onClick={() => onEdit("date")}
                className="text-blue-600 hover:text-blue-700 text-sm underline mt-1"
              >
                Edit Date/Time
              </button>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <h4 className="font-medium text-gray-900">Party Size</h4>
              <p className="text-gray-600">
                {partySize} {partySize === 1 ? "guest" : "guests"}
              </p>
              <button
                type="button"
                onClick={() => onEdit("time")}
                className="text-blue-600 hover:text-blue-700 text-sm underline mt-1"
              >
                Edit Party Size
              </button>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Customer Information
            </h3>
            <button
              type="button"
              onClick={() => onEdit("customer")}
              className="text-blue-600 hover:text-blue-700 text-sm underline"
            >
              Edit Details
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Contact Details
              </h4>
              <p className="text-gray-700">
                {customerDetails.title} {customerDetails.firstName}{" "}
                {customerDetails.surname}
              </p>
              <p className="text-gray-600 text-sm">{customerDetails.email}</p>
              <p className="text-gray-600 text-sm">{customerDetails.mobile}</p>
              {customerDetails.phone && (
                <p className="text-gray-600 text-sm">
                  Alt: {customerDetails.phone}
                </p>
              )}
            </div>

            {customerDetails.specialRequests && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Special Requests
                </h4>
                <p className="text-gray-700 text-sm bg-white p-3 rounded border">
                  {customerDetails.specialRequests}
                </p>
              </div>
            )}
          </div>

          {(customerDetails.emailConsent || customerDetails.smsConsent) && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <h4 className="font-medium text-gray-900 mb-2">
                Marketing Preferences
              </h4>
              <div className="flex flex-wrap gap-2">
                {customerDetails.emailConsent && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Email Updates
                  </span>
                )}
                {customerDetails.smsConsent && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    SMS Updates
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Important Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg
              className="w-5 h-5 text-yellow-600 mr-2 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">
                Important Information
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Please arrive 10 minutes before your reservation time</li>
                <li>
                  • Late arrivals may result in reduced dining time or
                  cancellation
                </li>
                <li>
                  • Cancellations must be made at least 2 hours in advance
                </li>
                <li>• For groups of 6 or more, a deposit may be required</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="border-t pt-6">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="termsAccepted"
              {...register("termsAccepted", {
                required: "You must accept the terms and conditions",
              })}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <label
                htmlFor="termsAccepted"
                className="text-sm font-medium text-gray-700"
              >
                I agree to the{" "}
                <a
                  href="/terms"
                  className="text-blue-600 hover:text-blue-700 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-700 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </label>
              {errors.termsAccepted && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.termsAccepted.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={!isValid || isLoading || isConfirming}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-lg"
          >
            {isConfirming || isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Confirming Booking...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Confirm Booking
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
