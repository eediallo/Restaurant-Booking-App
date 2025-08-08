import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { useAvailabilitySearch } from "../../hooks/useBookingApi";
import { Button } from "../ui/Button";
import type { AvailabilitySlot } from "../../types";

interface AvailabilitySearchProps {
  onAvailabilityFound: (data: {
    visitDate: string;
    partySize: number;
    availableSlots: AvailabilitySlot[];
  }) => void;
  onError: (error: string) => void;
}

interface SearchFormData {
  visitDate: string;
  partySize: number;
}

export const AvailabilitySearch: React.FC<AvailabilitySearchProps> = ({
  onAvailabilityFound,
  onError,
}) => {
  const { isAuthenticated } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const availabilityMutation = useAvailabilitySearch();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SearchFormData>();

  const watchedDate = watch("visitDate");
  const watchedPartySize = watch("partySize");

  // Create a memoized function to avoid useEffect dependency issues
  const handleAvailabilitySearch = useCallback(
    async (data: SearchFormData) => {
      if (!isAuthenticated) {
        onError("Please log in to check availability");
        return;
      }

      try {
        setIsSearching(true);
        const result = await availabilityMutation.mutateAsync({
          visitDate: data.visitDate,
          partySize: Number(data.partySize),
        });

        onAvailabilityFound({
          visitDate: data.visitDate,
          partySize: Number(data.partySize),
          availableSlots: result.available_slots,
        });
      } catch (error) {
        console.error("Availability search failed:", error);
        onError("Failed to search availability. Please try again.");
      } finally {
        setIsSearching(false);
      }
    },
    [isAuthenticated, availabilityMutation, onAvailabilityFound, onError]
  );

  // Set minimum date to today and maximum to 30 days from now
  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const onSubmit = (data: SearchFormData) => {
    handleAvailabilitySearch(data);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Find Available Times
        </h2>
        <p className="text-gray-600">
          Select your preferred date and party size to see available time slots.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Picker */}
          <div>
            <label
              htmlFor="visitDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Preferred Date
            </label>
            <input
              type="date"
              id="visitDate"
              min={today}
              max={maxDate}
              {...register("visitDate", {
                required: "Please select a date",
                validate: (value) => {
                  const selectedDate = new Date(value);
                  const todayDate = new Date(today);
                  const maxDateObj = new Date(maxDate);

                  if (selectedDate < todayDate) {
                    return "Cannot select past dates";
                  }
                  if (selectedDate > maxDateObj) {
                    return "Cannot book more than 30 days in advance";
                  }
                  return true;
                },
              })}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.visitDate ? "border-red-500" : ""
              }`}
            />
            {errors.visitDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.visitDate.message}
              </p>
            )}
          </div>

          {/* Party Size Selector */}
          <div>
            <label
              htmlFor="partySize"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Party Size
            </label>
            <select
              id="partySize"
              {...register("partySize", {
                required: "Please select party size",
                min: { value: 1, message: "Minimum 1 person" },
                max: { value: 12, message: "Maximum 12 people" },
              })}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.partySize ? "border-red-500" : ""
              }`}
            >
              <option value="">Select party size</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((size) => (
                <option key={size} value={size}>
                  {size} {size === 1 ? "Person" : "People"}
                </option>
              ))}
            </select>
            {errors.partySize && (
              <p className="text-red-500 text-sm mt-1">
                {errors.partySize.message}
              </p>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            loading={isSearching}
            disabled={!watchedDate || !watchedPartySize || !isAuthenticated}
            className="px-8 py-3 text-lg"
            size="lg"
          >
            {isSearching ? "Searching..." : "Check Availability"}
          </Button>
        </div>

        {!isAuthenticated && (
          <div className="text-center">
            <p className="text-amber-600 text-sm">
              Please log in to check availability and make reservations.
            </p>
          </div>
        )}
      </form>

      {/* Loading State */}
      {isSearching && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Searching available times...</span>
          </div>
        </div>
      )}
    </div>
  );
};
