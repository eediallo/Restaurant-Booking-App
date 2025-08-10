import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./BookingDetails.css";

const BookingDetails = () => {
  const { bookingReference } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [existingReview, setExistingReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        // First try to get booking from user's dashboard to get restaurant info
        const dashboardResponse = await api.get(`/api/user/bookings`);
        const userBooking = dashboardResponse.data.find(
          (b) => b.booking_reference === bookingReference
        );

        if (userBooking) {
          // Use the restaurant name from the user's booking data
          const restaurantNameFromBooking =
            userBooking.restaurant_name || "TheHungryUnicorn";
          setRestaurantName(restaurantNameFromBooking);
          const response = await api.get(
            `/api/ConsumerApi/v1/Restaurant/${restaurantNameFromBooking}/Booking/${bookingReference}`
          );
          setBooking(response.data);

          // Check for existing review
          await checkExistingReview();
        } else {
          // Fallback to default restaurant if booking not found in user's list
          const defaultRestaurant = "TheHungryUnicorn";
          setRestaurantName(defaultRestaurant);
          const response = await api.get(
            `/api/ConsumerApi/v1/Restaurant/${defaultRestaurant}/Booking/${bookingReference}`
          );
          setBooking(response.data);

          // Check for existing review
          await checkExistingReview();
        }
      } catch (err) {
        setError("Failed to load booking details");
        console.error("Error fetching booking details:", err);
      } finally {
        setLoading(false);
      }
    };

    const checkExistingReview = async () => {
      try {
        setReviewLoading(true);
        const reviewResponse = await api.get(
          `/api/reviews/booking/${bookingReference}`
        );
        setExistingReview(reviewResponse.data);
      } catch (err) {
        // No review exists - this is expected for many bookings
        setExistingReview(null);
      } finally {
        setReviewLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingReference]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isBookingCompleted = () => {
    if (!booking) return false;
    const bookingDateTime = new Date(
      `${booking.visit_date}T${booking.visit_time}`
    );
    return bookingDateTime < new Date();
  };

  const canWriteReview = () => {
    return (
      isBookingCompleted() &&
      !existingReview &&
      booking?.status?.toLowerCase() === "confirmed"
    );
  };

  const hasExistingReview = () => {
    return existingReview !== null;
  };

  if (loading) {
    return (
      <div className="booking-details">
        <div className="loading">Loading booking details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-details">
        <div className="error-message">{error}</div>
        <button
          className="action-btn secondary"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="booking-details">
        <div className="error-message">Booking not found</div>
        <button
          className="action-btn secondary"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="booking-details">
      <div className="booking-details-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h1>Booking Details</h1>
      </div>

      <div className="booking-details-card">
        <div className="booking-status-header">
          <h2>Reservation Confirmation</h2>
          <span className={`status-badge ${booking.status?.toLowerCase()}`}>
            {booking.status || "Confirmed"}
          </span>
        </div>

        <div className="booking-info-grid">
          <div className="info-section">
            <h3>Reservation Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Restaurant:</span>
                <span className="value">{restaurantName}</span>
              </div>
              <div className="info-item">
                <span className="label">Date:</span>
                <span className="value">{formatDate(booking.visit_date)}</span>
              </div>
              <div className="info-item">
                <span className="label">Time:</span>
                <span className="value">{formatTime(booking.visit_time)}</span>
              </div>
              <div className="info-item">
                <span className="label">Party Size:</span>
                <span className="value">{booking.party_size} guests</span>
              </div>
              <div className="info-item">
                <span className="label">Reference Number:</span>
                <span className="value booking-ref">
                  {booking.booking_reference}
                </span>
              </div>
            </div>
          </div>

          {booking.customer && (
            <div className="info-section">
              <h3>Contact Information</h3>
              <div className="info-grid">
                {booking.customer.title && (
                  <div className="info-item">
                    <span className="label">Title:</span>
                    <span className="value">{booking.customer.title}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="label">Name:</span>
                  <span className="value">
                    {booking.customer.first_name} {booking.customer.surname}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{booking.customer.email}</span>
                </div>
                {booking.customer.mobile && (
                  <div className="info-item">
                    <span className="label">Mobile:</span>
                    <span className="value">{booking.customer.mobile}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {booking.special_requests && (
          <div className="info-section special-requests">
            <h3>Special Requests</h3>
            <p className="special-requests-text">{booking.special_requests}</p>
          </div>
        )}

        <div className="booking-timestamps">
          <div className="timestamp-item">
            <span className="label">Booking Created:</span>
            <span className="value">
              {booking.created_at ? formatDateTime(booking.created_at) : "N/A"}
            </span>
          </div>
          {booking.updated_at && booking.updated_at !== booking.created_at && (
            <div className="timestamp-item">
              <span className="label">Last Modified:</span>
              <span className="value">
                {formatDateTime(booking.updated_at)}
              </span>
            </div>
          )}
        </div>

        <div className="booking-actions">
          {booking.status?.toLowerCase() === "confirmed" && (
            <>
              <button
                className="action-btn primary"
                onClick={() =>
                  navigate(`/booking/${booking.booking_reference}/edit`)
                }
              >
                Edit Booking
              </button>
              <button
                className="action-btn danger"
                onClick={() =>
                  navigate(`/booking/${booking.booking_reference}/cancel`)
                }
              >
                Cancel Booking
              </button>
            </>
          )}

          {/* Review Actions */}
          {canWriteReview() && (
            <button
              className="action-btn tertiary"
              onClick={() => navigate(`/review/${bookingReference}`)}
            >
              Write a Review
            </button>
          )}

          {hasExistingReview() && (
            <div className="review-info">
              <p className="review-exists">✓ You have reviewed this booking</p>
              <button
                className="action-btn tertiary"
                onClick={() => navigate(`/review/${bookingReference}`)}
              >
                View Your Review
              </button>
            </div>
          )}

          <button
            className="action-btn secondary"
            onClick={() => window.print()}
          >
            Print Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
