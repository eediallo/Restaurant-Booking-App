import React, { useState } from "react";
import {
  useUserBookings,
  useUpdateBooking,
  useCancelBooking,
} from "../../hooks/useBookingApi";
import { Button } from "../ui/Button";
import { EditBookingModal } from "../booking/EditBookingModal";
import { CancelBookingModal } from "../booking/CancelBookingModal";
import type { Booking } from "../../types";

interface BookingHistoryProps {
  onClose?: () => void;
}

export const BookingHistory: React.FC<BookingHistoryProps> = ({ onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(
    null
  );
  const [actionError, setActionError] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string>("");

  const { data, isLoading, error } = useUserBookings(
    currentPage,
    10,
    statusFilter || undefined
  );

  const updateBookingMutation = useUpdateBooking();
  const cancelBookingMutation = useCancelBooking();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
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

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case "confirmed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "cancelled":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "completed":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const isUpcoming = (booking: Booking) => {
    const bookingDateTime = new Date(
      `${booking.visit_date}T${booking.visit_time}`
    );
    return bookingDateTime > new Date() && booking.status !== "cancelled";
  };

  const handleUpdateBooking = async (updates: {
    VisitDate?: string;
    VisitTime?: string;
    PartySize?: number;
    SpecialRequests?: string;
  }) => {
    if (!editingBooking) return;

    try {
      setActionError("");
      await updateBookingMutation.mutateAsync({
        bookingReference: editingBooking.booking_reference,
        updates,
      });
      setActionSuccess("Booking updated successfully!");
      setEditingBooking(null);

      // Clear success message after 3 seconds
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (error) {
      setActionError("Failed to update booking. Please try again.");
      console.error("Update booking error:", error);
    }
  };

  const handleCancelBooking = async (cancellationReasonId: number) => {
    if (!cancellingBooking) return;

    try {
      setActionError("");
      await cancelBookingMutation.mutateAsync({
        bookingReference: cancellingBooking.booking_reference,
        cancellationReasonId,
      });
      setActionSuccess("Booking cancelled successfully!");
      setCancellingBooking(null);

      // Clear success message after 3 seconds
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (error) {
      setActionError("Failed to cancel booking. Please try again.");
      console.error("Cancel booking error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-2">Failed to load booking history</p>
          <p className="text-gray-500 text-sm">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Booking History</h3>
        {onClose && (
          <Button variant="outline" onClick={onClose} className="text-sm">
            Close
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6">
        {/* Success/Error Messages */}
        {actionError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{actionError}</p>
          </div>
        )}

        {actionSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{actionSuccess}</p>
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1); // Reset to first page when filtering
          }}
          className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Bookings</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Bookings List */}
      {!data?.bookings || data.bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3a4 4 0 118 0v4m-4 8v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">No bookings found</p>
          <p className="text-gray-500 text-sm">
            {statusFilter
              ? "Try adjusting your filters"
              : "Make your first booking to see it here"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.bookings.map((booking) => (
            <div
              key={booking.id}
              className={`border rounded-lg p-4 ${
                isUpcoming(booking)
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      Booking #{booking.booking_reference}
                    </h4>
                    <span className={getStatusBadge(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                    {isUpcoming(booking) && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Upcoming
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Date & Time:</span>
                      <div className="font-medium">
                        {formatDate(booking.visit_date)}
                      </div>
                      <div className="text-gray-600">
                        {formatTime(booking.visit_time)}
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-500">Party Size:</span>
                      <div className="font-medium">
                        {booking.party_size}{" "}
                        {booking.party_size === 1 ? "guest" : "guests"}
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-500">Restaurant:</span>
                      <div className="font-medium">The Hungry Unicorn</div>
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-500">Special Requests:</span>
                      <div className="text-gray-700 italic">
                        "{booking.special_requests}"
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  {isUpcoming(booking) && (
                    <>
                      <Button
                        variant="outline"
                        className="text-xs"
                        onClick={() => setEditingBooking(booking)}
                        disabled={
                          updateBookingMutation.isPending ||
                          cancelBookingMutation.isPending
                        }
                      >
                        Modify
                      </Button>
                      <Button
                        variant="outline"
                        className="text-xs text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => setCancellingBooking(booking)}
                        disabled={
                          updateBookingMutation.isPending ||
                          cancelBookingMutation.isPending
                        }
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="text-sm"
          >
            Previous
          </Button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {data.pages} ({data.total} total)
          </span>

          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage(Math.min(data.pages, currentPage + 1))
            }
            disabled={currentPage === data.pages}
            className="text-sm"
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          isOpen={!!editingBooking}
          onClose={() => setEditingBooking(null)}
          onSubmit={handleUpdateBooking}
          isLoading={updateBookingMutation.isPending}
        />
      )}

      {/* Cancel Booking Modal */}
      {cancellingBooking && (
        <CancelBookingModal
          booking={cancellingBooking}
          isOpen={!!cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          onConfirm={handleCancelBooking}
          isLoading={cancelBookingMutation.isPending}
        />
      )}
    </div>
  );
};
