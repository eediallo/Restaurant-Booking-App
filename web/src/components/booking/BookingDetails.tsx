import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBookingDetails, useCancelBooking } from "../../hooks/useBookingApi";
import { PageLayout } from "../layout/PageLayout";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { NotificationBanner } from "../ui/NotificationBanner";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";

export const BookingDetails: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
    isVisible: boolean;
  } | null>(null);

  const {
    data: booking,
    isLoading,
    error,
  } = useBookingDetails(reference || "");
  const cancelBookingMutation = useCancelBooking();

  const handleCancelBooking = async () => {
    if (!reference) return;

    try {
      await cancelBookingMutation.mutateAsync({
        bookingReference: reference,
        cancellationReasonId: 1,
      });

      setNotification({
        type: "success",
        message: "Booking cancelled successfully",
        isVisible: true,
      });

      setShowCancelModal(false);

      // Redirect after a delay
      setTimeout(() => {
        navigate("/my-bookings");
      }, 2000);
    } catch (err) {
      console.error("Cancel booking error:", err);
      setNotification({
        type: "error",
        message: "Failed to cancel booking. Please try again.",
        isVisible: true,
      });
      setShowCancelModal(false);
    }
  };

  const handleModifyBooking = () => {
    // Navigate to booking flow with pre-filled data
    navigate("/booking", {
      state: {
        modifyBooking: true,
        bookingData: booking,
      },
    });
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
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isUpcomingBooking =
    booking &&
    new Date(`${booking.visit_date}T${booking.visit_time}`) > new Date();
  const isCancellable =
    booking && booking.status !== "cancelled" && isUpcomingBooking;

  if (isLoading) {
    return (
      <PageLayout title="Booking Details">
        <Card>
          <LoadingSkeleton />
        </Card>
      </PageLayout>
    );
  }

  if (error || !booking) {
    return (
      <PageLayout title="Booking Details">
        <Card className="text-center">
          <div className="py-12">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Booking Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find the booking you're looking for.
            </p>
            <Button onClick={() => navigate("/my-bookings")} variant="primary">
              View All Bookings
            </Button>
          </div>
        </Card>
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout title="Booking Details">
        <div className="space-y-6">
          {/* Booking Status */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Booking #{booking.booking_reference}
                </h2>
                <div className="flex items-center mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </span>
                </div>
              </div>

              {isCancellable && (
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={handleModifyBooking}>
                    Modify Booking
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setShowCancelModal(true)}
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Reservation Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-900 font-medium">
                        {formatDate(booking.visit_date)}
                      </p>
                      <p className="text-sm text-gray-500">Date</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-900 font-medium">
                        {formatTime(booking.visit_time)}
                      </p>
                      <p className="text-sm text-gray-500">Time</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-900 font-medium">
                        {booking.party_size}{" "}
                        {booking.party_size === 1 ? "Guest" : "Guests"}
                      </p>
                      <p className="text-sm text-gray-500">Party Size</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Additional Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Channel</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {booking.channel_code}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Booked On</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {new Date(booking.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  {booking.special_requests && (
                    <div>
                      <p className="text-sm text-gray-500">Special Requests</p>
                      <p className="text-sm text-gray-900">
                        {booking.special_requests}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Actions for past bookings */}
          {!isUpcomingBooking && booking.status !== "cancelled" && (
            <Card>
              <div className="text-center py-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Book Again?
                </h3>
                <p className="text-gray-600 mb-4">
                  Had a great experience? Make another reservation with the same
                  details.
                </p>
                <Button
                  variant="primary"
                  onClick={() =>
                    navigate("/booking", {
                      state: {
                        rebookData: {
                          visit_date: booking.visit_date,
                          visit_time: booking.visit_time,
                          party_size: booking.party_size,
                          special_requests: booking.special_requests,
                        },
                      },
                    })
                  }
                >
                  Book Again
                </Button>
              </div>
            </Card>
          )}
        </div>
      </PageLayout>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Cancel your reservation?
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone. Your table will be released and
                made available to other guests.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Booking Details:</h4>
            <p className="text-sm text-gray-600">
              {formatDate(booking.visit_date)} at{" "}
              {formatTime(booking.visit_time)} • {booking.party_size} guests
            </p>
          </div>

          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              disabled={cancelBookingMutation.isPending}
            >
              Keep Booking
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelBooking}
              loading={cancelBookingMutation.isPending}
            >
              Yes, Cancel Booking
            </Button>
          </div>
        </div>
      </Modal>

      {/* Notification */}
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={() => setNotification(null)}
          autoClose={true}
          autoCloseDelay={5000}
        />
      )}
    </>
  );
};
