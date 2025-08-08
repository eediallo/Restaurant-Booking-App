import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useAvailabilitySearch,
  useCreateBooking,
} from "../../hooks/useBookingApi";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import type { BookingRequest, AvailabilitySlot } from "../../types";

interface BookingFormData {
  visitDate: string;
  visitTime: string;
  partySize: number;
  specialRequests?: string;
}

export const BookingForm: React.FC = () => {
  const [availabilitySearched, setAvailabilitySearched] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>();

  const watchedDate = watch("visitDate");
  const watchedPartySize = watch("partySize");

  const availabilityMutation = useAvailabilitySearch();
  const createBookingMutation = useCreateBooking();

  const handleSearchAvailability = async (
    data: Pick<BookingFormData, "visitDate" | "partySize">
  ) => {
    try {
      await availabilityMutation.mutateAsync({
        visitDate: data.visitDate,
        partySize: Number(data.partySize),
      });
      setAvailabilitySearched(true);
    } catch (error) {
      console.error("Availability search failed:", error);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    try {
      const bookingData: BookingRequest = {
        VisitDate: data.visitDate,
        VisitTime: data.visitTime,
        PartySize: Number(data.partySize),
        ChannelCode: "ONLINE",
        SpecialRequests: data.specialRequests,
      };

      const booking = await createBookingMutation.mutateAsync(bookingData);
      console.log("Booking created successfully:", booking);
      // Redirect to confirmation page or show success message
    } catch (error) {
      console.error("Booking creation failed:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Make a Reservation
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="visitDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Visit Date
          </label>
          <Input
            type="date"
            id="visitDate"
            {...register("visitDate", { required: "Visit date is required" })}
            className={errors.visitDate ? "border-red-500" : ""}
          />
          {errors.visitDate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.visitDate.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="partySize"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Party Size
          </label>
          <Input
            type="number"
            id="partySize"
            min="1"
            max="12"
            {...register("partySize", {
              required: "Party size is required",
              min: { value: 1, message: "Party size must be at least 1" },
              max: { value: 12, message: "Party size cannot exceed 12" },
            })}
            className={errors.partySize ? "border-red-500" : ""}
          />
          {errors.partySize && (
            <p className="text-red-500 text-sm mt-1">
              {errors.partySize.message}
            </p>
          )}
        </div>

        {watchedDate && watchedPartySize && !availabilitySearched && (
          <Button
            type="button"
            onClick={() =>
              handleSearchAvailability({
                visitDate: watchedDate,
                partySize: Number(watchedPartySize),
              })
            }
            disabled={availabilityMutation.isPending}
            className="w-full"
          >
            {availabilityMutation.isPending
              ? "Searching..."
              : "Check Availability"}
          </Button>
        )}

        {availabilityMutation.data && (
          <div className="bg-green-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-green-800 mb-2">
              Available Time Slots:
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {availabilityMutation.data.available_slots
                .filter((slot: AvailabilitySlot) => slot.available)
                .map((slot: AvailabilitySlot) => (
                  <label
                    key={slot.time}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="radio"
                      value={slot.time}
                      {...register("visitTime", {
                        required: "Please select a time slot",
                      })}
                      className="text-blue-600"
                    />
                    <span className="text-sm">{slot.time}</span>
                  </label>
                ))}
            </div>
            {errors.visitTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.visitTime.message}
              </p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="specialRequests"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Special Requests (Optional)
          </label>
          <textarea
            id="specialRequests"
            rows={3}
            {...register("specialRequests")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any special dietary requirements or preferences..."
          />
        </div>

        {availabilitySearched && (
          <Button
            type="submit"
            disabled={createBookingMutation.isPending}
            className="w-full"
          >
            {createBookingMutation.isPending
              ? "Creating Booking..."
              : "Confirm Booking"}
          </Button>
        )}
      </form>

      {availabilityMutation.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">
            Failed to search availability. Please try again.
          </p>
        </div>
      )}

      {createBookingMutation.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">
            Failed to create booking. Please try again.
          </p>
        </div>
      )}
    </div>
  );
};
