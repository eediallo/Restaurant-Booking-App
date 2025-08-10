import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import BookingCard from "../components/BookingCard";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userBookings, setUserBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [cancellationReasons, setCancellationReasons] = useState([]);

  // New filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    fetchUserBookings();
    fetchCancellationReasons();

    // Listen for cancel booking events from BookingCard component
    const handleCancelBookingEvent = (event) => {
      handleCancelBooking(event.detail);
    };

    document.addEventListener("cancelBooking", handleCancelBookingEvent);

    return () => {
      document.removeEventListener("cancelBooking", handleCancelBookingEvent);
    };
  }, []);

  // Filter and sort bookings whenever filters or bookings change
  useEffect(() => {
    let filtered = [...userBookings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.booking_reference
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.special_requests
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (booking.customer?.first_name + " " + booking.customer?.surname)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (booking) =>
          booking.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(
        (booking) => new Date(booking.visit_date) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(
        (booking) => new Date(booking.visit_date) <= new Date(dateRange.end)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.visit_date) - new Date(b.visit_date);
        case "date-desc":
          return new Date(b.visit_date) - new Date(a.visit_date);
        case "created-asc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "created-desc":
          return new Date(b.created_at) - new Date(a.created_at);
        case "party-size-asc":
          return a.party_size - b.party_size;
        case "party-size-desc":
          return b.party_size - a.party_size;
        default:
          return new Date(b.visit_date) - new Date(a.visit_date);
      }
    });

    setFilteredBookings(filtered);
  }, [userBookings, searchTerm, statusFilter, dateRange, sortBy]);

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
        <h1>Welcome back, {user?.first_name || user?.username}!</h1>
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
        <div className="bookings-header">
          <h2>Your Reservations</h2>
          <div className="bookings-stats">
            {userBookings.length > 0 && (
              <span className="booking-count">
                Showing {filteredBookings.length} of {userBookings.length}{" "}
                bookings
              </span>
            )}
          </div>
        </div>

        {/* Filtering and Search Controls */}
        {userBookings.length > 0 && (
          <div className="booking-filters">
            <div className="filter-row">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by reference, name, or special requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-controls">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="created-desc">Recently Created</option>
                  <option value="created-asc">Oldest Created</option>
                  <option value="party-size-desc">Largest Party</option>
                  <option value="party-size-asc">Smallest Party</option>
                </select>
              </div>
            </div>

            <div className="date-filter-row">
              <div className="date-filters">
                <div className="date-input-group">
                  <label htmlFor="start-date">From:</label>
                  <input
                    id="start-date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        start: e.target.value,
                      }))
                    }
                    className="date-input"
                  />
                </div>
                <div className="date-input-group">
                  <label htmlFor="end-date">To:</label>
                  <input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, end: e.target.value }))
                    }
                    className="date-input"
                  />
                </div>
                {(dateRange.start || dateRange.end) && (
                  <button
                    onClick={() => setDateRange({ start: "", end: "" })}
                    className="clear-dates-btn"
                  >
                    Clear Dates
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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
            ) : filteredBookings.length === 0 ? (
              <div className="no-bookings">
                <h3>No bookings match your filters</h3>
                <p>Try adjusting your search or filter criteria.</p>
                <button
                  className="action-btn secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setDateRange({ start: "", end: "" });
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="bookings-grid">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.booking_reference}
                    booking={booking}
                    onEdit={handleEditBooking}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
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
