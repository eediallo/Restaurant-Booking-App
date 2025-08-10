import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/user/bookings");
      setUserBookings(response.data);
    } catch (err) {
      setError("Failed to load your bookings");
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username}!</h1>
        <p>Manage your reservations and discover new dining experiences</p>
      </div>

      <div className="dashboard-actions">
        <button
          className="action-btn primary"
          onClick={() => (window.location.href = "/book")}
        >
          Make New Reservation
        </button>
        <button
          className="action-btn secondary"
          onClick={() => (window.location.href = "/availability")}
        >
          Check Availability
        </button>
      </div>

      <div className="bookings-section">
        <h2>Your Reservations</h2>

        {loading && <div className="loading">Loading your bookings...</div>}

        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <>
            {userBookings.length === 0 ? (
              <div className="no-bookings">
                <h3>No reservations yet</h3>
                <p>Ready to make your first booking?</p>
                <button
                  className="action-btn primary"
                  onClick={() => (window.location.href = "/book")}
                >
                  Book a Table
                </button>
              </div>
            ) : (
              <div className="bookings-grid">
                {userBookings.map((booking) => (
                  <div key={booking.booking_reference} className="booking-card">
                    <div className="booking-header">
                      <h3>TheHungryUnicorn</h3>
                      <span
                        className={`status ${booking.status?.toLowerCase()}`}
                      >
                        {booking.status || "Confirmed"}
                      </span>
                    </div>

                    <div className="booking-details">
                      <div className="detail-item">
                        <span className="label">Date:</span>
                        <span className="value">
                          {formatDate(booking.visit_date)}
                        </span>
                      </div>

                      <div className="detail-item">
                        <span className="label">Time:</span>
                        <span className="value">
                          {formatTime(booking.visit_time)}
                        </span>
                      </div>

                      <div className="detail-item">
                        <span className="label">Party Size:</span>
                        <span className="value">
                          {booking.party_size} guests
                        </span>
                      </div>

                      <div className="detail-item">
                        <span className="label">Reference:</span>
                        <span className="value">
                          {booking.booking_reference}
                        </span>
                      </div>

                      {booking.special_requests && (
                        <div className="detail-item">
                          <span className="label">Special Requests:</span>
                          <span className="value">
                            {booking.special_requests}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="booking-actions">
                      <button
                        className="action-btn secondary small"
                        onClick={() =>
                          (window.location.href = `/booking/${booking.booking_reference}`)
                        }
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
