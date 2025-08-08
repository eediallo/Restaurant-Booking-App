import React from "react";
import {
  useUserBookingsList,
  useCancelBooking,
} from "../../hooks/useBookingApi";
import { Button } from "../ui/Button";
import type { Booking } from "../../types";

export const UserBookings: React.FC = () => {
  const { data: bookings, isLoading, error } = useUserBookingsList();
  const cancelBookingMutation = useCancelBooking();

  const handleCancelBooking = async (bookingReference: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await cancelBookingMutation.mutateAsync({
          bookingReference,
          cancellationReasonId: 1,
        });
      } catch (error) {
        console.error("Failed to cancel booking:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading your bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">
          Failed to load bookings. Please try again.
        </p>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Bookings Yet</h2>
        <p className="text-gray-600 mb-6">
          You haven't made any reservations yet. Start by making your first
          booking!
        </p>
        <Button
          onClick={() => (window.location.href = "/booking")}
          className="inline-flex items-center"
        >
          Make a Booking
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Bookings</h2>

      <div className="space-y-4">
        {bookings.map((booking: Booking) => (
          <div
            key={booking.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Ref: {booking.booking_reference}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Date & Time</h3>
                    <p className="text-gray-600">
                      {formatDate(booking.visit_date)}
                    </p>
                    <p className="text-gray-600">
                      {formatTime(booking.visit_time)}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">Party Size</h3>
                    <p className="text-gray-600">
                      {booking.party_size}{" "}
                      {booking.party_size === 1 ? "person" : "people"}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">Channel</h3>
                    <p className="text-gray-600">{booking.channel_code}</p>
                  </div>
                </div>

                {booking.special_requests && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-1">
                      Special Requests
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {booking.special_requests}
                    </p>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  Booked on {new Date(booking.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="ml-4 flex flex-col space-y-2">
                {booking.status === "confirmed" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Navigate to booking details or edit page
                        window.location.href = `/booking/${booking.booking_reference}`;
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleCancelBooking(booking.booking_reference)
                      }
                      disabled={cancelBookingMutation.isPending}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      {cancelBookingMutation.isPending
                        ? "Cancelling..."
                        : "Cancel"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
