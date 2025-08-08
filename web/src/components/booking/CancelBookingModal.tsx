import React, { useState } from "react";
import { Button } from "../ui/Button";
import type { Booking } from "../../types";

interface CancelBookingModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (cancellationReasonId: number) => Promise<void>;
  isLoading: boolean;
}

const CANCELLATION_REASONS = [
  { id: 1, label: "Change of plans" },
  { id: 2, label: "Emergency" },
  { id: 3, label: "Found another restaurant" },
  { id: 4, label: "Party size changed" },
  { id: 5, label: "Other" },
];

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  booking,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [selectedReason, setSelectedReason] = useState<number>(1);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
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

  const handleConfirm = async () => {
    await onConfirm(selectedReason);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Cancel Booking
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">
              Booking #{booking.booking_reference}
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Date:</span>{" "}
                {formatDate(booking.visit_date)}
              </p>
              <p>
                <span className="font-medium">Time:</span>{" "}
                {formatTime(booking.visit_time)}
              </p>
              <p>
                <span className="font-medium">Party Size:</span>{" "}
                {booking.party_size}{" "}
                {booking.party_size === 1 ? "guest" : "guests"}
              </p>
              <p>
                <span className="font-medium">Restaurant:</span> The Hungry
                Unicorn
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <svg
                className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div className="text-sm text-red-700">
                <p className="font-medium mb-1">This action cannot be undone</p>
                <p>
                  Once cancelled, you'll need to make a new booking if you
                  change your mind.
                </p>
              </div>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Reason for cancellation:
            </label>
            <div className="space-y-2">
              {CANCELLATION_REASONS.map((reason) => (
                <label key={reason.id} className="flex items-center">
                  <input
                    type="radio"
                    name="cancellationReason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={(e) =>
                      setSelectedReason(parseInt(e.target.value))
                    }
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {reason.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Cancellation Policy</p>
              <p>
                Free cancellation up to 2 hours before your reservation time.
                Late cancellations may incur charges.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Keep Booking
            </Button>
            <Button
              onClick={handleConfirm}
              loading={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Cancel Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
