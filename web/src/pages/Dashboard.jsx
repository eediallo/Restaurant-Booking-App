import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [cancellationReasons, setCancellationReasons] = useState([]);

  useEffect(() => {
    fetchUserBookings();
    fetchCancellationReasons();
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

  const fetchCancellationReasons = async () => {
    try {
      // For now, we'll use predefined reasons. In a real app, this would come from the API
      setCancellationReasons([
        { id: 1, reason: "Customer Request" },
        { id: 2, reason: "Restaurant Closure" },
        { id: 3, reason: "Weather" },
        { id: 4, reason: "Emergency" },
        { id: 5, reason: "No Show" },
      ]);
    } catch (err) {
      console.error("Error fetching cancellation reasons:", err);
    }
  };

  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setEditFormData({
      visitDate: booking.visit_date,
      visitTime: booking.visit_time,
      partySize: booking.party_size,
      specialRequests: booking.special_requests || "",
    });
    setShowEditModal(true);
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const submitEditBooking = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("VisitDate", editFormData.visitDate);
      formData.append("VisitTime", editFormData.visitTime);
      formData.append("PartySize", editFormData.partySize);
      formData.append("SpecialRequests", editFormData.specialRequests);

      await api.patch(
        `/api/ConsumerApi/v1/Restaurant/TheHungryUnicorn/Booking/${selectedBooking.booking_reference}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setShowEditModal(false);
      fetchUserBookings(); // Refresh the bookings list
      alert("Booking updated successfully!");
    } catch (err) {
      console.error("Error updating booking:", err);
      alert("Failed to update booking. Please try again.");
    }
  };

  const submitCancelBooking = async (cancellationReasonId) => {
    try {
      const formData = new FormData();
      formData.append("cancellationReasonId", cancellationReasonId);

      await api.post(
        `/api/ConsumerApi/v1/Restaurant/TheHungryUnicorn/Booking/${selectedBooking.booking_reference}/Cancel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setShowCancelModal(false);
      fetchUserBookings(); // Refresh the bookings list
      alert("Booking cancelled successfully!");
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking. Please try again.");
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
                  onClick={() => navigate("/availability")}
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
                      {booking.status?.toLowerCase() === "confirmed" && (
                        <>
                          <button
                            className="action-btn primary small"
                            onClick={() => handleEditBooking(booking)}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn danger small"
                            onClick={() => handleCancelBooking(booking)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <button
                        className="action-btn secondary small"
                        onClick={() =>
                          navigate(`/booking/${booking.booking_reference}`)
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

      {/* Edit Booking Modal */}
      {showEditModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Booking</h2>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={submitEditBooking} className="edit-booking-form">
              <div className="form-group">
                <label htmlFor="editVisitDate">Visit Date</label>
                <input
                  type="date"
                  id="editVisitDate"
                  value={editFormData.visitDate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      visitDate: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editVisitTime">Visit Time</label>
                <input
                  type="time"
                  id="editVisitTime"
                  value={editFormData.visitTime}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      visitTime: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editPartySize">Party Size</label>
                <select
                  id="editPartySize"
                  value={editFormData.partySize}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      partySize: parseInt(e.target.value),
                    })
                  }
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                    <option key={size} value={size}>
                      {size} {size === 1 ? "person" : "people"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="editSpecialRequests">Special Requests</label>
                <textarea
                  id="editSpecialRequests"
                  value={editFormData.specialRequests}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      specialRequests: e.target.value,
                    })
                  }
                  placeholder="Any special requirements..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn primary">
                  Update Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div
          className="modal-overlay"
          onClick={() => setShowCancelModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cancel Booking</h2>
              <button
                className="close-btn"
                onClick={() => setShowCancelModal(false)}
              >
                ×
              </button>
            </div>

            <div className="cancel-booking-content">
              <p>Are you sure you want to cancel your booking for:</p>
              <div className="booking-summary">
                <p>
                  <strong>Date:</strong>{" "}
                  {formatDate(selectedBooking.visit_date)}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {formatTime(selectedBooking.visit_time)}
                </p>
                <p>
                  <strong>Party Size:</strong> {selectedBooking.party_size}{" "}
                  guests
                </p>
                <p>
                  <strong>Reference:</strong>{" "}
                  {selectedBooking.booking_reference}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="cancellationReason">
                  Reason for cancellation
                </label>
                <select
                  id="cancellationReason"
                  onChange={(e) => {
                    if (e.target.value) {
                      submitCancelBooking(parseInt(e.target.value));
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">Select a reason...</option>
                  {cancellationReasons.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.reason}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
