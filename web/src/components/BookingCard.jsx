import React from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeGesture, triggerHapticFeedback } from "../utils/mobileUtils";

const BookingCard = ({ booking, onEdit, formatDate, formatTime }) => {
  const navigate = useNavigate();

  const swipeGestures = useSwipeGesture(
    () => {
      // Swipe left to edit
      if (booking.status?.toLowerCase() === "confirmed") {
        triggerHapticFeedback("light");
        onEdit(booking);
      }
    },
    () => {
      // Swipe right to view details
      triggerHapticFeedback("light");
      navigate(`/booking/${booking.booking_reference}`);
    }
  );

  return (
    <div className="booking-card" {...swipeGestures}>
      <div className="booking-header">
        <h3>TheHungryUnicorn</h3>
        <span className={`status ${booking.status?.toLowerCase()}`}>
          {booking.status || "Confirmed"}
        </span>
      </div>

      <div className="booking-details">
        <div className="detail-item">
          <span className="label">Date:</span>
          <span className="value">{formatDate(booking.visit_date)}</span>
        </div>

        <div className="detail-item">
          <span className="label">Time:</span>
          <span className="value">{formatTime(booking.visit_time)}</span>
        </div>

        <div className="detail-item">
          <span className="label">Party Size:</span>
          <span className="value">{booking.party_size} guests</span>
        </div>

        <div className="detail-item">
          <span className="label">Reference:</span>
          <span className="value">{booking.booking_reference}</span>
        </div>

        {booking.special_requests && (
          <div className="detail-item">
            <span className="label">Special Requests:</span>
            <span className="value">{booking.special_requests}</span>
          </div>
        )}
      </div>

      <div className="booking-actions">
        {booking.status?.toLowerCase() === "confirmed" && (
          <>
            <button
              className="action-btn primary small"
              onClick={() => onEdit(booking)}
            >
              Edit
            </button>
            <button
              className="action-btn danger small"
              onClick={() => {
                // This will be handled by parent component
                const event = new CustomEvent("cancelBooking", {
                  detail: booking,
                });
                document.dispatchEvent(event);
              }}
            >
              Cancel
            </button>
          </>
        )}
        <button
          className="action-btn secondary small"
          onClick={() => navigate(`/booking/${booking.booking_reference}`)}
        >
          View Details
        </button>
      </div>

      {/* Mobile swipe hint */}
      <div className="swipe-hint">
        <span>← Swipe to edit • Swipe to view →</span>
      </div>
    </div>
  );
};

export default BookingCard;
