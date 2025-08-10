import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./BookingDetails.css";

const BookingDetails = () => {
  const { bookingReference } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/api/ConsumerApi/v1/Restaurant/TheHungryUnicorn/Booking/${bookingReference}`
        );
        setBooking(response.data);
      } catch (err) {
        setError("Failed to load booking details");
        console.error("Error fetching booking details:", err);
      } finally {
        setLoading(false);
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
        <button 
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
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
                <span className="value">{booking.restaurant || "TheHungryUnicorn"}</span>
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
                <span className="value booking-ref">{booking.booking_reference}</span>
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
              <span className="value">{formatDateTime(booking.updated_at)}</span>
            </div>
          )}
        </div>

        <div className="booking-actions">
          {booking.status?.toLowerCase() === "confirmed" && (
            <>
              <button 
                className="action-btn primary"
                onClick={() => navigate(`/booking/${booking.booking_reference}/edit`)}
              >
                Edit Booking
              </button>
              <button 
                className="action-btn danger"
                onClick={() => navigate(`/booking/${booking.booking_reference}/cancel`)}
              >
                Cancel Booking
              </button>
            </>
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
