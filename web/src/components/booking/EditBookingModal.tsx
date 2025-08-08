import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import type { Booking } from "../../types";

interface EditBookingModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updates: {
    VisitDate?: string;
    VisitTime?: string;
    PartySize?: number;
    SpecialRequests?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

interface EditBookingFormData {
  visitDate: string;
  visitTime: string;
  partySize: number;
  specialRequests: string;
}

export const EditBookingModal: React.FC<EditBookingModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditBookingFormData>({
    defaultValues: {
      visitDate: booking.visit_date,
      visitTime: booking.visit_time,
      partySize: booking.party_size,
      specialRequests: booking.special_requests || "",
    },
  });

  const handleFormSubmit = async (data: EditBookingFormData) => {
    const updates: {
      VisitDate?: string;
      VisitTime?: string;
      PartySize?: number;
      SpecialRequests?: string;
    } = {};

    // Only include fields that have changed
    if (data.visitDate !== booking.visit_date) {
      updates.VisitDate = data.visitDate;
    }
    if (data.visitTime !== booking.visit_time) {
      updates.VisitTime = data.visitTime;
    }
    if (data.partySize !== booking.party_size) {
      updates.PartySize = data.partySize;
    }
    if (data.specialRequests !== (booking.special_requests || "")) {
      updates.SpecialRequests = data.specialRequests;
    }

    await onSubmit(updates);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Booking #{booking.booking_reference}
            </h3>
            <button
              onClick={handleClose}
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

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Date */}
            <Input
              label="Visit Date"
              type="date"
              {...register("visitDate", {
                required: "Visit date is required",
                validate: (value) => {
                  const selectedDate = new Date(value);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return selectedDate >= today || "Date cannot be in the past";
                },
              })}
              error={errors.visitDate?.message}
            />

            {/* Time */}
            <Input
              label="Visit Time"
              type="time"
              {...register("visitTime", {
                required: "Visit time is required",
              })}
              error={errors.visitTime?.message}
            />

            {/* Party Size */}
            <Input
              label="Party Size"
              type="number"
              min="1"
              max="20"
              {...register("partySize", {
                required: "Party size is required",
                min: {
                  value: 1,
                  message: "Party size must be at least 1",
                },
                max: {
                  value: 20,
                  message: "Party size cannot exceed 20",
                },
                valueAsNumber: true,
              })}
              error={errors.partySize?.message}
            />

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests
              </label>
              <textarea
                {...register("specialRequests")}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special requirements..."
              />
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-yellow-400 mr-2 mt-0.5"
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
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">Important:</p>
                  <p>
                    Changes are subject to availability. If your preferred time
                    is not available, we'll contact you with alternatives.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" loading={isLoading} className="flex-1">
                Update Booking
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
