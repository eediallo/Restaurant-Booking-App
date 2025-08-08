import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useUserBookingsList,
  useCancelBooking,
} from "../../hooks/useBookingApi";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import type { Booking } from "../../types";

interface BookingCardProps {
  booking: Booking;
  onCancel: (bookingId: string) => void;
  onModify: (bookingId: string) => void;
  isCancelling: boolean;
}

// Helper functions
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

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onCancel,
  onModify,
  isCancelling,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const bookingDate = new Date(booking.visit_date);
  const today = new Date();
  const isUpcoming = bookingDate > today;
  const isPast = bookingDate < today;
  const canCancel = booking.status === "confirmed" && isUpcoming;
  const canModify = booking.status === "confirmed" && isUpcoming;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Booking #{booking.booking_reference}
          </h3>
          {isPast && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Past
            </span>
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
            booking.status
          )}`}
        >
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-600 font-medium">Date</p>
          <p className="text-gray-800 font-semibold">
            {formatDate(booking.visit_date)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600 font-medium">Time</p>
          <p className="text-gray-800 font-semibold">
            {formatTime(booking.visit_time)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600 font-medium">Party Size</p>
          <p className="text-gray-800 font-semibold">
            {booking.party_size} {booking.party_size === 1 ? "guest" : "guests"}
          </p>
        </div>
      </div>

      {booking.special_requests && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 font-medium mb-1">
            Special Requests
          </p>
          <p className="text-gray-800 text-sm">{booking.special_requests}</p>
        </div>
      )}

      {booking.created_at && (
        <div className="mb-4">
          <p className="text-xs text-gray-500">
            Booked on {new Date(booking.created_at).toLocaleDateString()}
          </p>
        </div>
      )}

      {(canCancel || canModify) && (
        <div className="flex space-x-3 pt-4 border-t border-gray-100">
          {canCancel && (
            <button
              onClick={() => onCancel(booking.booking_reference)}
              disabled={isCancelling}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
            >
              {isCancelling ? "Cancelling..." : "Cancel Booking"}
            </button>
          )}
          {canModify && (
            <button
              onClick={() => onModify(booking.booking_reference)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              Modify Booking
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const UserBookings: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  const { data: bookings, isLoading, error } = useUserBookingsList();
  const cancelBookingMutation = useCancelBooking();

  const handleCancelBooking = async (bookingReference: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking? This action cannot be undone."
    );

    if (confirmed) {
      try {
        await cancelBookingMutation.mutateAsync({
          bookingReference,
          cancellationReasonId: 1,
        });
        queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      } catch (error) {
        console.error("Failed to cancel booking:", error);
        alert("Failed to cancel booking. Please try again or contact support.");
      }
    }
  };

  const handleModifyBooking = (bookingReference: string) => {
    // TODO: Implement modify booking functionality
    console.log("Modify booking:", bookingReference);
    alert("Modify booking functionality coming soon!");
  };

  const filteredBookings =
    bookings?.filter((booking: Booking) => {
      const bookingDate = new Date(booking.visit_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (filter) {
        case "upcoming":
          return bookingDate >= today && booking.status !== "cancelled";
        case "past":
          return bookingDate < today || booking.status === "cancelled";
        default:
          return true;
      }
    }) || [];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Your Bookings
          </h2>
          <p className="text-gray-600">Manage your restaurant reservations</p>
        </div>
        <LoadingSkeleton rows={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Failed to load bookings
          </h3>
          <p className="text-gray-600 mb-4">
            We couldn't retrieve your bookings. Please try again.
          </p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["user-bookings"] })
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Your Bookings
          </h2>
          <p className="text-gray-600">Manage your restaurant reservations</p>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3a4 4 0 118 0v4M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No bookings yet
          </h3>
          <p className="text-gray-600 mb-6">
            You haven't made any restaurant reservations yet.
          </p>
          <a
            href="/booking"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Make Your First Booking
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Bookings</h2>
        <p className="text-gray-600">Manage your restaurant reservations</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: "all", label: "All Bookings" },
            { key: "upcoming", label: "Upcoming" },
            { key: "past", label: "Past" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filter === tab.key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No bookings found for the selected filter.
            </p>
          </div>
        ) : (
          filteredBookings.map((booking: Booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
              onModify={handleModifyBooking}
              isCancelling={cancelBookingMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
};
